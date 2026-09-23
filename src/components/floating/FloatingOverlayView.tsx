import React, { useRef, useLayoutEffect, useCallback } from "react";
import { X } from "lucide-react";
import { AIState, ChatMessage } from "../../types/agent";
import { MessageBubble } from "../chat/MessageBubble";
import { ChatInput } from "../chat/ChatInput";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingOverlayViewProps {
  aiState: AIState;
  setAiState: (state: AIState) => void;
  messages: ChatMessage[];
  currentMessage?: ChatMessage;
  recognizedText: string;
  setRecognizedText: (text: string) => void;
  onSendMessage: (text: string) => void;
  onClose: () => void;
  onExpand: () => void;
  onCollapse: () => void;
  onRetry?: () => void;
}

export const FloatingOverlayView: React.FC<FloatingOverlayViewProps> = ({
  aiState,
  setAiState,
  messages,
  currentMessage,
  setRecognizedText,
  onSendMessage,
  onClose,
  onExpand,
  onCollapse,
  onRetry,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgLengthRef = useRef(messages.length);

  const handleRetryAction = useCallback((q?: string, lastUserQuery?: string) => {
    if (onRetry) {
      onRetry();
    } else {
      const queryToSend = q || lastUserQuery;
      if (queryToSend) {
        onSendMessage(queryToSend);
      }
    }
  }, [onRetry, onSendMessage]);

  const handleChipClickAction = useCallback((chip: string) => {
    onSendMessage(chip);
  }, [onSendMessage]);

  const handleConfirmPayloadAction = useCallback((payload: Record<string, any>) => {
    if (payload?.roomName) {
      onSendMessage(
        `${payload.roomName} ${payload.seatNo ? payload.seatNo + "번 " : ""}좌석 배정 신청을 진행해줘`
      );
    }
  }, [onSendMessage]);

  // 새 메시지가 추가되거나 질문 전송 시: 마지막 사용자 질문으로 instant 스크롤 고정
  useLayoutEffect(() => {
    if (messages.length > prevMsgLengthRef.current) {
      prevMsgLengthRef.current = messages.length;

      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (lastUserMsg && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const targetEl = document.getElementById(`floating-msg-${lastUserMsg.id}`);
        if (targetEl) {
          const containerRect = container.getBoundingClientRect();
          const targetRect = targetEl.getBoundingClientRect();
          const offset = targetRect.top - containerRect.top;
          container.scrollTop = Math.max(0, container.scrollTop + offset - 8);
        }
      }
    }
    prevMsgLengthRef.current = messages.length;
  }, [messages.length]);

  const isExpanded = aiState === "expanded";
  const isAnsweringOrExpanded = aiState === "answering" || aiState === "expanded" || aiState === "thinking";
  const isGenerating = Boolean(currentMessage?.isStreaming || aiState === "thinking");

  const dragStartYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  const handleHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartYRef.current = e.clientY;
    isDraggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleHandlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const deltaY = e.clientY - dragStartYRef.current;
    if (deltaY < -35) {
      // 위로 드래그 -> 전체화면 확장
      onExpand();
    } else if (deltaY > 40) {
      // 아래로 드래그 -> 축소 또는 닫기
      if (isExpanded) {
        onCollapse();
      } else {
        onClose();
      }
    } else if (Math.abs(deltaY) < 6) {
      // 순수 탭/클릭
      if (isExpanded) onCollapse();
      else onExpand();
    }
  };

  const handleMessageSubmit = (text: string) => {
    setRecognizedText(text);
    if (aiState !== "expanded") {
      setAiState("answering");
    }
    onSendMessage(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className={`fixed inset-0 w-full h-full flex flex-col justify-end select-none transition-all duration-300 ${
        isExpanded ? "p-0" : "p-3 pb-3"
      }`}
    >
      {/* 전체화면(expanded) 모드일 때 우상단 플로팅 X 닫기 버튼 */}
      {isExpanded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="fixed top-3.5 right-3.5 z-50 p-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer pointer-events-auto"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* 캡슐 및 카드 바깥 영역 터치 시 닫기 레이어 */}
      {!isExpanded && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute inset-0 z-0 pointer-events-auto"
        />
      )}

      {/* 2. Answering & Expanded 상태: Full 버전의 채팅 화면을 그대로 공용 활용 */}
      <AnimatePresence>
        {isAnsweringOrExpanded && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3 }}
            className={`relative z-10 w-full max-w-xl mx-auto flex flex-col pointer-events-auto bg-[#f8fafe]/95 backdrop-blur-3xl border border-white/90 shadow-[0_16px_48px_rgba(0,30,90,0.14)] text-slate-900 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isExpanded
                ? "h-full rounded-none border-none pb-safe"
                : "rounded-[32px] max-h-[calc(92dvh-90px)] mb-3 overflow-hidden"
            }`}
            style={{
              willChange: "height, transform, opacity",
            }}
          >
          {/* 바텀시트일 때만 상단 드래그 핸들 표시 (전체화면일 때는 제거) */}
          {!isExpanded && (
            <div
              onPointerDown={handleHandlePointerDown}
              onPointerUp={handleHandlePointerUp}
              className="w-full pt-3 pb-2 flex items-center justify-center cursor-grab active:cursor-grabbing shrink-0 z-30 touch-none select-none"
              title="위로 드래그하여 전체화면으로 확장"
            >
              <div className="w-10 h-1.5 rounded-full bg-slate-300/80 hover:bg-slate-400 active:scale-95 transition-all" />
            </div>
          )}

          {/* 본문 스크롤 영역: Full Version의 메시지 목록을 100% 동일하게 렌더링 */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 space-y-4 select-text text-sm leading-relaxed text-slate-800 custom-scrollbar"
          >
            {messages.map((msg, idx) => {
              const prevUserMsg = messages
                .slice(0, idx)
                .reverse()
                .find((m) => m.role === "user");
              const lastUserQuery = prevUserMsg?.content;

              return (
                <div key={msg.id} id={`floating-msg-${msg.id}`} className="w-full">
                  <MessageBubble
                    message={msg}
                    lastUserQuery={lastUserQuery}
                    onRetry={(q) => handleRetryAction(q, lastUserQuery)}
                    onChipClick={handleChipClickAction}
                    onConfirmAction={handleConfirmPayloadAction}
                  />
                </div>
              );
            })}
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. 공용 ChatInput 컴포넌트 (플로팅 입력창) */}
      <ChatInput
        onSendMessage={handleMessageSubmit}
        isLoading={isGenerating}
        onStopGeneration={() => setAiState("listening")}
        placeholder="챗불이에게 물어보기"
        autoFocus={true}
        onExpand={onExpand}
        onClose={onClose}
        onLogoClick={onExpand}
        isFloating={true}
      />
    </motion.div>
  );
};
