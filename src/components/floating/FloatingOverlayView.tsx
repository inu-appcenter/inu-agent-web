import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import {
  Mic,
  Send,
  Square,
  X,
} from "lucide-react";
import { AIState, ChatMessage } from "../../types/agent";
import { MessageBubble } from "../chat/MessageBubble";
import chatbotLogo from "../../assets/chatbot-logo.svg";

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
  recognizedText,
  setRecognizedText,
  onSendMessage,
  onClose,
  onExpand,
  onCollapse,
  onRetry,
}) => {
  const [inputText, setInputText] = useState("");
  const [isTextInputActive, setIsTextInputActive] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
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

  // 에이전트 입력창이 열리거나 답변 스트리밍이 완료되었을 때 입력창 자동 포커스 (모바일 가상 키보드 즉시 호출)
  useEffect(() => {
    if (aiState !== "closed" && !currentMessage?.isStreaming && aiState !== "thinking") {
      setIsTextInputActive(true);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [aiState, currentMessage?.isStreaming]);

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

  // 음성 인식 시작 (지원 시)
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsTextInputActive(true);
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "ko-KR";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setAiState("listening");
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");

        setRecognizedText(transcript);
        if (event.results[0].isFinal) {
          setAiState("recognized");
          setTimeout(() => {
            if (transcript.trim()) {
              onSendMessage(transcript);
            }
          }, 300);
        }
      };

      recognition.onerror = () => {
        setIsTextInputActive(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      };

      recognition.onend = () => {
        if (!recognizedText) {
          setIsTextInputActive(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      };

      recognition.start();
    } catch {
      setIsTextInputActive(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };


  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText("");
    setIsTextInputActive(false);
    setRecognizedText(text);
    setAiState("answering");
    onSendMessage(text);
  };

  if (aiState === "closed") {
    return null;
  }

  const isExpanded = aiState === "expanded";
  const isAnsweringOrExpanded = aiState === "answering" || aiState === "expanded" || aiState === "thinking";

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

  // 캡슐만 있는 상태에서 위로 끌어올리면 전체화면으로 전환하는 핸들러
  const capsuleStartYRef = useRef<number>(0);
  const isCapsuleDraggingRef = useRef<boolean>(false);

  const handleCapsulePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    capsuleStartYRef.current = e.clientY;
    isCapsuleDraggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleCapsulePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isCapsuleDraggingRef.current) return;
    isCapsuleDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const deltaY = e.clientY - capsuleStartYRef.current;
    if (deltaY < -30) {
      // 위로 끌어 올림 -> 전체화면 확장
      onExpand();
    } else if (deltaY > 35) {
      // 아래로 끌어 내림 -> 닫기
      onClose();
    } else {
      // 일반 클릭 / 탭 -> 입력창 포커스
      setIsTextInputActive(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div
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
      {isAnsweringOrExpanded && messages.length > 0 && (
        <div
          className={`relative z-10 w-full max-w-xl mx-auto flex flex-col pointer-events-auto bg-[#f8fafe]/95 backdrop-blur-3xl border border-white/90 shadow-[0_16px_48px_rgba(0,30,90,0.14)] text-slate-900 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isExpanded
              ? "h-full rounded-none border-none pb-safe"
              : "rounded-[32px] max-h-[calc(92dvh-90px)] mb-3 overflow-hidden"
          }`}
          style={{
            willChange: "height, transform",
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
        </div>
      )}

      {/* 3. Floating Capsule (하단 도킹 순백색 알약 캡슐) */}
      <div className="w-full max-w-xl mx-auto pointer-events-auto relative z-20">
        <div
          onPointerDown={handleCapsulePointerDown}
          onPointerUp={handleCapsulePointerUp}
          className="relative flex items-center justify-between px-4 py-2.5 rounded-full bg-white/95 border border-white/90 backdrop-blur-2xl shadow-[0_8px_28px_rgba(0,30,80,0.12)] text-slate-800 cursor-pointer transition-all duration-300 hover:shadow-[0_12px_36px_rgba(0,30,80,0.16)] active:scale-[0.99] touch-none"
        >
          {/* 좌측: 순수 챗불이 로고 + 상태 라벨 / 텍스트 입력창 */}
          <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
            <img
              src={chatbotLogo}
              alt="AI"
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
              className="w-6 h-6 object-contain shrink-0 cursor-pointer active:scale-90 transition-transform"
              title="전체화면으로 확장"
            />

            {isTextInputActive ? (
              <form onSubmit={handleTextSubmit} className="flex-1 flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="챗불이에게 물어보기"
                  className="w-full bg-transparent border-none outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-semibold"
                  autoFocus
                />
              </form>
            ) : (
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-semibold tracking-tight truncate text-slate-800">
                  {aiState === "listening" && "챗불이에게 물어보기"}
                  {aiState === "recognized" && (recognizedText || "인식 완료")}
                  {aiState === "thinking" && "생각하는 중..."}
                  {aiState === "answering" && (currentMessage?.isStreaming ? "답변 중..." : "챗불이에게 물어보기")}
                  {aiState === "expanded" && (currentMessage?.isStreaming ? "답변 중..." : "챗불이에게 물어보기")}
                </span>
              </div>
            )}
          </div>

          {/* 우측: 전송 버튼 또는 정지 버튼 또는 마이크 아이콘 */}
          <div className="flex items-center gap-2 shrink-0">
            {isTextInputActive ? (
              <button
                onClick={handleTextSubmit}
                disabled={!inputText.trim()}
                className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            ) : currentMessage?.isStreaming ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAiState("listening");
                }}
                className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95"
                title="중지"
              >
                <Square className="w-2.5 h-2.5 fill-current" />
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startSpeechRecognition();
                }}
                className="p-1.5 rounded-full text-slate-500 hover:text-blue-600 active:scale-95 transition-all"
                title="음성 입력"
              >
                <Mic className="w-4 h-4 text-blue-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
