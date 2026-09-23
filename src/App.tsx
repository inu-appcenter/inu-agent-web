import { useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { useAgentStream } from "./hooks/useAgentStream";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { QuickPrompts } from "./components/chat/QuickPrompts";
import { MessageBubble } from "./components/chat/MessageBubble";
import { ChatInput } from "./components/chat/ChatInput";
import { FloatingOverlayView } from "./components/floating/FloatingOverlayView";
import ellipse2 from "./assets/ellipse2.svg";

export default function App() {
  const {
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
    aiState,
    setAiState,
    recognizedText,
    setRecognizedText,
  } = useAgentStream();

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const prevMsgLengthRef = useRef(currentRoom.messages.length);
  const prevRoomIdRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    // 대화방 전환 또는 초기 진입 시: 마지막 사용자 질문 말풍선 위치로 instant 스크롤 고정
    if (prevRoomIdRef.current !== currentRoomId) {
      prevRoomIdRef.current = currentRoomId;
      prevMsgLengthRef.current = currentRoom.messages.length;

      if (currentRoom.messages.length === 0) {
        if (chatAreaRef.current) {
          chatAreaRef.current.scrollTop = 0;
        }
        return;
      }

      // 마지막 사용자 질문 말풍선 찾기
      const lastUserMsg = [...currentRoom.messages].reverse().find((m) => m.role === "user");

      const scrollToLastQuestion = () => {
        if (!chatAreaRef.current) return;
        const container = chatAreaRef.current;
        if (lastUserMsg) {
          const targetEl = document.getElementById(`msg-${lastUserMsg.id}`);
          if (targetEl) {
            const containerRect = container.getBoundingClientRect();
            const targetRect = targetEl.getBoundingClientRect();
            const offset = targetRect.top - containerRect.top;
            // 상단 여백 16px를 두고 마지막 질문 말풍선이 화면 상단에 즉시 맞춰지도록 스크롤
            container.scrollTop = Math.max(0, container.scrollTop + offset - 16);
            return;
          }
        }
        container.scrollTop = 0;
      };

      // 렌더링 페인트 전 즉시 위치 설정 (애니메이션 없이 고정된 채 렌더링)
      scrollToLastQuestion();

      // 브라우저 렌더링 파이프라인 레이아웃 지연 보정용 즉시 1회 재보정
      const frameId = requestAnimationFrame(() => {
        scrollToLastQuestion();
      });

      return () => cancelAnimationFrame(frameId);
    }
  }, [currentRoomId, currentRoom.messages]);

  useEffect(() => {
    // 요구사항 8: 스트리밍 중 드래그다운되는 스크롤 동작 완전 제거
    // 동일한 방 내에서 사용자가 새 질문을 보냈거나 새 메시지가 추가되었을 때 1회만 스크롤
    if (prevRoomIdRef.current === currentRoomId) {
      if (currentRoom.messages.length > prevMsgLengthRef.current) {
        if (chatAreaRef.current) {
          chatAreaRef.current.scrollTo({
            top: chatAreaRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }
    }
    prevMsgLengthRef.current = currentRoom.messages.length;
  }, [currentRoom.messages.length, currentRoomId]);

  const handleSelectRoom = (id: string) => {
    setCurrentRoomId(id);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    createNewRoom();
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  const isFloatingMode = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return (
      params.get("mode") === "floating" ||
      (typeof window !== "undefined" && window.parent && window.parent !== window)
    );
  }, []);

  const lastAssistantMessage = useMemo(() => {
    return [...currentRoom.messages].reverse().find((m) => m.role === "assistant");
  }, [currentRoom.messages]);

  const lastUserMessage = useMemo(() => {
    return [...currentRoom.messages].reverse().find((m) => m.role === "user");
  }, [currentRoom.messages]);

  // 플로팅 모드이고 아직 전체화면(expanded)으로 확장되지 않은 경우 플로팅 오버레이 뷰만 렌더링
  if (isFloatingMode && aiState !== "expanded") {
    return (
      <div className="fixed inset-0 w-full h-full bg-transparent overflow-hidden select-none">
        <FloatingOverlayView
          aiState={aiState}
          setAiState={setAiState}
          messages={currentRoom.messages}
          currentMessage={lastAssistantMessage}
          recognizedText={recognizedText || lastUserMessage?.content || ""}
          setRecognizedText={setRecognizedText}
          onSendMessage={sendMessage}
          onClose={() => setAiState("closed")}
          onExpand={() => setAiState("expanded")}
          onCollapse={() => setAiState("answering")}
          onRetry={() => {
            if (lastUserMessage?.content) {
              sendMessage(lastUserMessage.content);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex fixed inset-0 h-[100dvh] bg-gradient-to-br from-[#f0f0ff] via-[#f7f8ff] to-[#fdfdff] font-sans antialiased overflow-hidden select-none">
      {/* Floating Mode일 때 Expanded 상태 컨트롤 바 */}
      {isFloatingMode && (
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-xs shadow-lg">
          <div
            onClick={() => setAiState("answering")}
            className="w-8 h-1 bg-white/40 rounded-full cursor-pointer hover:bg-white/80 active:scale-95 transition-all"
            title="바텀시트로 축소"
          />
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed md:hidden inset-0 bg-black/30 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Sidebar (Multi-Room History) */}
      <Sidebar
        isOpen={isSidebarOpen}
        rooms={rooms}
        currentRoomId={currentRoomId}
        onSelectRoom={handleSelectRoom}
        onNewChat={handleNewChat}
        onDeleteRoom={deleteRoom}
        onUpdateRoomTitle={updateRoomTitle}
        onClearHistory={clearHistory}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Ambient Bottom Glowing Orb */}
        <img
          src={ellipse2}
          alt=""
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[30%] w-[512px] max-w-[120vw] aspect-[512/549.5] pointer-events-none z-0 opacity-60"
        />

        {/* Top Header */}
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onNewChat={handleNewChat}
          clientTenant={clientTenant}
        />

        {/* Scrollable Chat Message Area */}
        <div
          ref={chatAreaRef}
          style={{
            paddingBottom:
              "calc(110px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))",
          }}
          className="flex-1 w-full px-4 md:px-8 pt-2 md:pt-3 flex flex-col items-center z-10 overscroll-contain select-text custom-scrollbar overflow-y-auto"
        >
          {currentRoom.messages.length === 0 ? (
            <div className="w-full max-w-3xl flex flex-col items-center my-auto min-h-0">
              <QuickPrompts onSelect={(prompt) => sendMessage(prompt)} />
            </div>
          ) : (
            <div className="w-full max-w-3xl flex flex-col items-center">
              {currentRoom.messages.map((msg, idx) => {
                const prevUserMsg = currentRoom.messages
                  .slice(0, idx)
                  .reverse()
                  .find((m) => m.role === "user");
                const lastUserQuery = prevUserMsg?.content;

                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    lastUserQuery={lastUserQuery}
                    onRetry={(q) => {
                      const queryToSend = q || lastUserQuery;
                      if (queryToSend) {
                        sendMessage(queryToSend);
                      }
                    }}
                    onChipClick={(chip) => sendMessage(chip)}
                    onConfirmAction={(payload) => {
                      if (payload?.roomName) {
                        sendMessage(
                          `${payload.roomName} ${payload.seatNo ? payload.seatNo + "번 " : ""}좌석 배정 신청을 진행해줘`
                        );
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Glow Chat Input Bar */}
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
          onStopGeneration={stopGeneration}
          placeholder="챗불이에게 물어보기"
        />
      </main>
    </div>
  );
}


