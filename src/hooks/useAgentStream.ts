import { useState, useCallback, useEffect, useRef } from "react";
import { ChatMessage, GenerativeCard, ClientActionInstruction, ClientActionResult } from "../types/agent";

const CORE_URL = import.meta.env.VITE_AGENT_CORE_URL || "http://localhost:8000";

export function useAgentStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clientTenant, setClientTenant] = useState<string>("INTIP");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize client tenant from URL parameter e.g. ?client=UNIDORM
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clientParam = params.get("client") || import.meta.env.VITE_DEFAULT_CLIENT || "INTIP";
    setClientTenant(clientParam.toUpperCase());
  }, []);

  // Listen for Native Mobile App (Action Runner) bridge responses (CustomEvent & postMessage)
  useEffect(() => {
    const handleActionResult = async (rawPayload: any) => {
      try {
        if (!rawPayload) return;
        
        let actionResult: ClientActionResult | null = null;
        
        if (rawPayload.type === "executeAgentActionResult" || rawPayload.type === "AGENT_ACTION_RESULT") {
          actionResult = {
            action_id: rawPayload.requestId || rawPayload.payload?.action_id || rawPayload.result?.action_id || "action_reported",
            success: Boolean(rawPayload.success),
            data: rawPayload.data !== undefined ? rawPayload.data : rawPayload.result?.data,
            error_message: rawPayload.errorMessage || rawPayload.result?.error_message,
            error_code: rawPayload.errorCode || rawPayload.result?.error_code,
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
            setMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
                const currentCards = updated[lastIdx].cards || [];
                updated[lastIdx] = {
                  ...updated[lastIdx],
                  cards: [...currentCards, reportData.card],
                };
              }
              return updated;
            });
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
    return () => {
      window.removeEventListener("intipAgentResult", handleCustomEvent);
      window.removeEventListener("message", handleMessageEvent);
    };
  }, []);

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

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(`${CORE_URL}/api/v1/chat/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-AppCenter-Client": clientTenant,
          },
          body: JSON.stringify({
            message: text,
            client: clientTenant,
            history: messages.slice(-6).map((m) => ({
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
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: msg.content + event.content }
                      : msg
                  )
                );
              } else if (event.event_type === "CARD" && event.card) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, cards: [...(msg.cards || []), event.card] }
                      : msg
                  )
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
                } else {
                  // Fallback card for standalone web browser
                  const fallbackCard: GenerativeCard = {
                    card_type: "METRIC_CARD",
                    title: `[${action.auth_domain}] 보안 학교 연동 안내`,
                    main_metric: {
                      label: "모바일 앱 전용 기능",
                      value: "INTIP 앱 지원",
                    },
                    sub_details: [
                      {
                        label: "안내",
                        value: "성적 및 학적 조회는 개인정보 보호(Zero-Knowledge)를 위해 INTIP 모바일 앱에서 직접 연동됩니다.",
                      },
                    ],
                  };
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId
                        ? { ...msg, cards: [...(msg.cards || []), fallbackCard] }
                        : msg
                    )
                  );
                }
              } else if (event.event_type === "DONE") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
                  )
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
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    content: msg.content || "오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
                    isStreaming: false,
                  }
                : msg
            )
          );
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [isLoading, messages, clientTenant]
  );

  const resetChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    clientTenant,
    sendMessage,
    resetChat,
  };
}
