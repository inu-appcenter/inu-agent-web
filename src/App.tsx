import { useRef, useEffect } from "react";
import { useAgentStream } from "./hooks/useAgentStream";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { QuickPrompts } from "./components/chat/QuickPrompts";
import { MessageBubble } from "./components/chat/MessageBubble";
import { ChatInput } from "./components/chat/ChatInput";
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
  } = useAgentStream();

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const prevMsgLengthRef = useRef(currentRoom.messages.length);

  useEffect(() => {
    // 요구사항 8: 스트리밍 중 드래그다운되는 스크롤 동작 완전 제거
    // 사용자가 새 질문을 보냈거나 새 메시지가 추가되었을 때 1회만 스크롤
    if (currentRoom.messages.length > prevMsgLengthRef.current) {
      if (chatAreaRef.current) {
        chatAreaRef.current.scrollTo({
          top: chatAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }
    prevMsgLengthRef.current = currentRoom.messages.length;
  }, [currentRoom.messages.length]);

  const handleSelectRoom = (id: string) => {
    setCurrentRoomId(id);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    createNewRoom();
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  return (
    <div className="flex fixed inset-0 h-[100dvh] bg-gradient-to-br from-[#f0f0ff] via-[#f7f8ff] to-[#fdfdff] font-sans antialiased overflow-hidden select-none">
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
          style={{ paddingBottom: "calc(110px + env(safe-area-inset-bottom, 0px))" }}
          className="flex-1 overflow-y-auto px-4 md:px-8 pt-4 flex flex-col items-center z-10 overscroll-contain select-text custom-scrollbar"
        >
          {currentRoom.messages.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center w-full max-w-3xl py-6">
              <QuickPrompts onSelect={(prompt) => sendMessage(prompt)} />
            </div>
          ) : (
            <div className="w-full max-w-3xl flex flex-col items-center">
              {currentRoom.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onChipClick={(chip) => sendMessage(chip)}
                  onConfirmAction={(payload) => {
                    if (payload?.roomName) {
                      sendMessage(`${payload.roomName} ${payload.seatNo ? payload.seatNo + "번 " : ""}좌석 배정 신청을 진행해줘`);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating Glow Chat Input Bar */}
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
          onStopGeneration={stopGeneration}
          placeholder="인천대학교 캠퍼스 생활에 대해 무엇이든 물어보세요!"
        />
      </main>
    </div>
  );
}

