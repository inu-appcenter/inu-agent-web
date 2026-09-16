import { useState, useCallback, useEffect, useRef } from "react";
import {
  ChatMessage,
  ChatRoom,
  GenerativeCard,
  ClientActionInstruction,
  ClientActionResult,
} from "../types/agent";

const CORE_URL = import.meta.env.VITE_AGENT_CORE_URL || "http://localhost:8000";
const STORAGE_KEY = "intip_agent_rooms_v1";

const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "room-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
};

export function useAgentStream() {
  const [rooms, setRooms] = useState<ChatRoom[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("로컬 대화방 로드 실패:", e);
    }
    const initialId = generateUUID();
    return [{ id: initialId, title: "새로운 대화", createdAt: Date.now(), messages: [] }];
  });

  const [currentRoomId, setCurrentRoomId] = useState<string>(() => rooms[0]?.id || generateUUID());
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [clientTenant, setClientTenant] = useState<string>("INTIP");
  const [clientContext, setClientContext] = useState<Record<string, any> | null>(null);
  const clientContextRef = useRef<Record<string, any> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize client tenant from URL parameter e.g. ?client=UNIDORM
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clientParam = params.get("client") || import.meta.env.VITE_DEFAULT_CLIENT || "INTIP";
    setClientTenant(clientParam.toUpperCase());
  }, []);

  // Save rooms to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    } catch (e) {
      console.warn("로컬 대화방 저장 실패:", e);
    }
  }, [rooms]);

  const currentRoom = rooms.find((r) => r.id === currentRoomId) || rooms[0];

  const createNewRoom = useCallback(() => {
    const newId = generateUUID();
    const newRoom: ChatRoom = {
      id: newId,
      title: "새로운 대화",
      createdAt: Date.now(),
      messages: [],
    };
    setRooms((prev) => [newRoom, ...prev]);
    setCurrentRoomId(newId);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  }, []);

  const deleteRoom = useCallback((id: string) => {
    setRooms((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      if (filtered.length === 0) {
        const freshId = generateUUID();
        return [{ id: freshId, title: "새로운 대화", createdAt: Date.now(), messages: [] }];
      }
      return filtered;
    });
    setCurrentRoomId((prevId) => {
      if (prevId === id) {
        const remaining = rooms.filter((r) => r.id !== id);
        return remaining[0]?.id || generateUUID();
      }
      return prevId;
    });
  }, [rooms]);

  const updateRoomTitle = useCallback((id: string, title: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, title } : r))
    );
  }, []);

  const clearHistory = useCallback(() => {
    const freshId = generateUUID();
    setRooms([{ id: freshId, title: "새로운 대화", createdAt: Date.now(), messages: [] }]);
    setCurrentRoomId(freshId);
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === currentRoomId
          ? {
              ...r,
              messages: r.messages.map((m) => ({ ...m, isStreaming: false })),
            }
          : r
      )
    );
  }, [currentRoomId]);

  // Listen for Native Mobile App (Action Runner) bridge responses and parent iframe messages
  useEffect(() => {
    const handleActionResult = async (rawPayload: any) => {
      try {
        if (!rawPayload) return;

        // Parent window (inu-portal-web) providing client context (academic, LMS events)
        if (rawPayload.type === "INTIP_CLIENT_CONTEXT" && rawPayload.clientContext) {
          console.log("[INU-Agent-Web] Received client context from parent:", rawPayload.clientContext);
          setClientContext(rawPayload.clientContext);
          clientContextRef.current = rawPayload.clientContext;
          return;
        }

        let actionResult: ClientActionResult | null = null;

        if (rawPayload.type === "executeAgentActionResult" || rawPayload.type === "AGENT_ACTION_RESULT") {
          const isSuccess = rawPayload.success !== undefined
            ? Boolean(rawPayload.success)
            : Boolean(rawPayload.result?.success);

          actionResult = {
            action_id: rawPayload.requestId || rawPayload.payload?.action_id || rawPayload.result?.action_id || "action_reported",
            success: isSuccess,
            data: rawPayload.data !== undefined ? rawPayload.data : rawPayload.result?.data,
            error_message: rawPayload.errorMessage || rawPayload.result?.errorMessage || rawPayload.result?.error_message,
            error_code: rawPayload.errorCode || rawPayload.result?.errorCode || rawPayload.result?.error_code,
          };
        }

        if (!actionResult) return;
        console.log("[INU-Agent-Web] Received native action result:", actionResult);

        // Report action result back to inu-agent-core to synthesize SDUI card
        const reportResp = await fetch(`${CORE_URL}/api/v1/action/report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(actionResult),
        });

        if (reportResp.ok) {
          const reportData = await reportResp.json();
          if (reportData.card) {
            setRooms((prev) =>
              prev.map((r) => {
                if (r.id !== currentRoomId) return r;
                const updatedMsgs = [...r.messages];
                const lastIdx = updatedMsgs.length - 1;
                if (lastIdx >= 0 && updatedMsgs[lastIdx].role === "assistant") {
                  const currentCards = updatedMsgs[lastIdx].cards || [];
                  updatedMsgs[lastIdx] = {
                    ...updatedMsgs[lastIdx],
                    cards: [...currentCards, reportData.card],
                  };
                }
                return { ...r, messages: updatedMsgs };
              })
            );
          }
        }
      } catch (err) {
        console.warn("[INU-Agent-Web] Error handling native action result:", err);
      }
    };

    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent?.detail) {
        handleActionResult(customEvent.detail);
      }
    };

    const handleMessageEvent = (event: MessageEvent) => {
      try {
        const payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        handleActionResult(payload);
      } catch {}
    };

    window.addEventListener("intipAgentResult", handleCustomEvent);
    window.addEventListener("message", handleMessageEvent);

    // If embedded inside an iframe (e.g. inu-portal-web AgentChatModal), request initial client context
    if (typeof window !== "undefined" && window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "GET_CLIENT_CONTEXT" }, "*");
    }

    return () => {
      window.removeEventListener("intipAgentResult", handleCustomEvent);
      window.removeEventListener("message", handleMessageEvent);
    };
  }, [currentRoomId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };

      const assistantMsgId = `asst_${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        isStreaming: true,
        timestamp: new Date().toISOString(),
      };

      // Set initial room title if this is the first message
      const isFirstMessage = currentRoom.messages.length === 0;
      const initialTitle = isFirstMessage
        ? text.slice(0, 18) + (text.length > 18 ? "..." : "")
        : currentRoom.title;

      setRooms((prev) =>
        prev.map((r) =>
          r.id === currentRoomId
            ? {
                ...r,
                title: initialTitle,
                messages: [...r.messages, userMsg, assistantMsg],
              }
            : r
        )
      );
      setIsLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const authToken =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("accessToken") ||
        new URLSearchParams(window.location.search).get("token") ||
        "";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-AppCenter-Client": clientTenant,
      };
      if (authToken) {
        headers["Authorization"] = authToken.startsWith("Bearer ") ? authToken : `Bearer ${authToken}`;
      }

      try {
        const response = await fetch(`${CORE_URL}/api/v1/chat/stream`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: text,
            client: clientTenant,
            client_context: clientContextRef.current || undefined,
            history: currentRoom.messages.slice(-6).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`서버 응답 오류 (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const jsonStr = trimmed.slice(6);
            if (jsonStr === "[DONE]") continue;

            try {
              const event = JSON.parse(jsonStr);

              if (event.event_type === "TOKEN" && event.content) {
                setRooms((prev) =>
                  prev.map((r) => {
                    if (r.id !== currentRoomId) return r;
                    return {
                      ...r,
                      messages: r.messages.map((msg) =>
                        msg.id === assistantMsgId
                          ? { ...msg, content: msg.content + event.content }
                          : msg
                      ),
                    };
                  })
                );
              } else if (event.event_type === "CARD" && event.card) {
                setRooms((prev) =>
                  prev.map((r) => {
                    if (r.id !== currentRoomId) return r;
                    return {
                      ...r,
                      messages: r.messages.map((msg) =>
                        msg.id === assistantMsgId
                          ? { ...msg, cards: [...(msg.cards || []), event.card] }
                          : msg
                      ),
                    };
                  })
                );
              } else if (event.event_type === "ACTION_REQUIRED" && event.action) {
                const action: ClientActionInstruction = event.action;
                console.log("[INU-Agent-Web] Action required:", action);

                // Forward to React Native Mobile WebView if available
                if ((window as any).ReactNativeWebView) {
                  (window as any).ReactNativeWebView.postMessage(
                    JSON.stringify({
                      type: "executeAgentAction",
                      payload: { instruction: action },
                      requestId: action.action_id,
                    })
                  );
                } else if (typeof window !== "undefined" && window.parent && window.parent !== window) {
                  // Forward to parent window (inu-portal-web) if embedded in iframe
                  window.parent.postMessage(
                    {
                      type: "EXECUTE_AGENT_ACTION",
                      instruction: action,
                      requestId: action.action_id,
                    },
                    "*"
                  );
                } else {
                  // Fallback card for standalone web browser
                  const domainLabel =
                    action.auth_domain === "LMS"
                      ? "이러닝(LMS)"
                      : action.auth_domain === "LIBRARY"
                      ? "도서관"
                      : "포털 종합정보";

                  const metricLabel =
                    action.auth_domain === "LMS"
                      ? "실시간 과제/진도율 확인"
                      : action.auth_domain === "LIBRARY"
                      ? "도서 대출/연체 조회"
                      : "학적 및 성적 조회";

                  const detailText =
                    action.auth_domain === "LMS"
                      ? "개인정보 보호(Zero-Knowledge)를 위해 이러닝 과제와 강의 진도는 INTIP 앱 또는 계정 연동을 통해 실시간으로 확인됩니다."
                      : "개인정보 보호(Zero-Knowledge)를 위해 개인 학적 및 성적 정보는 INTIP 앱 연동을 통해 확인됩니다.";

                  const fallbackCard: GenerativeCard = {
                    card_type: "METRIC_CARD",
                    title: `${domainLabel} 계정 연동 안내`,
                    main_metric: {
                      label: metricLabel,
                      value: "INTIP 연동",
                    },
                    sub_details: [
                      {
                        label: "보안 안내",
                        value: detailText,
                      },
                    ],
                  };

                  setRooms((prev) =>
                    prev.map((r) => {
                      if (r.id !== currentRoomId) return r;
                      return {
                        ...r,
                        messages: r.messages.map((msg) => {
                          if (msg.id !== assistantMsgId) return msg;
                          const currentCards = msg.cards || [];
                          if (currentCards.some((c) => ("title" in c && c.title === fallbackCard.title))) {
                            return msg;
                          }
                          return { ...msg, cards: [...currentCards, fallbackCard] };
                        }),
                      };
                    })
                  );
                }
              } else if (event.event_type === "DONE") {
                setRooms((prev) =>
                  prev.map((r) => {
                    if (r.id !== currentRoomId) return r;
                    return {
                      ...r,
                      messages: r.messages.map((msg) =>
                        msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
                      ),
                    };
                  })
                );
              }
            } catch (err) {
              console.warn("Failed to parse SSE JSON:", jsonStr, err);
            }
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Stream error:", err);
          setRooms((prev) =>
            prev.map((r) => {
              if (r.id !== currentRoomId) return r;
              return {
                ...r,
                messages: r.messages.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        content:
                          msg.content ||
                          "죄송합니다. 응답을 처리하는 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
                        isStreaming: false,
                      }
                    : msg
                ),
              };
            })
          );
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [isLoading, currentRoom, currentRoomId, clientTenant]
  );


  return {
    rooms,
    currentRoom,
    currentRoomId,
    setCurrentRoomId,
    isLoading,
    isSidebarOpen,
    setIsSidebarOpen,
    createNewRoom,
    deleteRoom,
    updateRoomTitle,
    clearHistory,
    stopGeneration,
    sendMessage,
    clientTenant,
    clientContext,
  };
}
