import React, { useState, useRef, useLayoutEffect } from "react";
import {
  Mic,
  Send,
  Square,
  Loader2,
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
  const [isTextInputActive, setIsTextInputActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgLengthRef = useRef(messages.length);

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

  const handleCapsuleClick = () => {
    setIsTextInputActive(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText("");
    setIsTextInputActive(false);
    setRecognizedText(text);
    setAiState("thinking");
    onSendMessage(text);
  };

  if (aiState === "closed") {
    return null;
  }

  const isExpanded = aiState === "expanded";
  const isAnsweringOrExpanded = aiState === "answering" || aiState === "expanded";

  // Thinking 상태일 때 표시할 타임라인 스텝 목록 (라이트 모드 One UI 스타일)
  const thinkingTimeline =
    currentMessage?.timeline && currentMessage.timeline.length > 0
      ? currentMessage.timeline
      : [
          { id: "1", text: "AI로 답변을 생성하고 있습니다", state: "completed" },
          ...(recognizedText
            ? [{ id: "2", text: `'${recognizedText}' 관련 정보 검색 중`, state: "completed" }]
            : []),
          { id: "3", text: "지식을 종합하고 답변을 정리하는 중입니다", state: "running" },
        ];

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

      {/* 1. Thinking 상태: 뒤쪽 라이트 글래스 확장 카드 */}
      {aiState === "thinking" && (
        <div className="relative z-10 w-full max-w-xl mx-auto mb-3 pointer-events-auto rounded-[32px] bg-[#f0f4fa]/95 backdrop-blur-3xl border border-white/90 shadow-[0_12px_36px_rgba(0,40,120,0.12)] p-5 animate-fade-in">
          {/* 수직 타임라인 진행 스텝 */}
          <div className="space-y-3.5 py-1">
            {thinkingTimeline.map((step, idx) => {
              const isLast = idx === thinkingTimeline.length - 1;
              const isRunning = step.state === "running" || isLast;
              return (
                <div key={step.id || idx} className="flex items-start gap-3">
                  {/* 스텝 아이콘 */}
                  <div className="relative flex flex-col items-center mt-0.5">
                    {isRunning ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 bg-transparent shrink-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      </div>
                    )}
                    {!isLast && (
                      <div className="w-[1.5px] h-5 bg-slate-300 my-0.5 border-dashed" />
                    )}
                  </div>

                  {/* 스텝 텍스트 */}
                  <span
                    className={`text-[13.5px] leading-snug tracking-tight ${
                      isRunning ? "font-semibold text-slate-900" : "text-slate-500"
                    }`}
                  >
                    {step.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Answering & Expanded 상태: Full 버전의 채팅 화면을 그대로 공용 활용 */}
      {isAnsweringOrExpanded && messages.length > 0 && (
        <div
          className={`relative z-10 w-full max-w-xl mx-auto flex flex-col pointer-events-auto bg-[#f8fafe]/95 backdrop-blur-3xl border border-white/90 shadow-[0_16px_48px_rgba(0,30,90,0.14)] text-slate-900 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isExpanded
              ? "h-full rounded-none border-none pb-safe"
              : "rounded-[32px] max-h-[calc(82dvh-90px)] mb-3 overflow-hidden"
          }`}
          style={{
            willChange: "height, transform",
          }}
        >
          {/* 순수 바텀시트 드래그 핸들 */}
          <div
            onClick={isExpanded ? onCollapse : onExpand}
            className="w-full pt-3 pb-2 flex items-center justify-center cursor-pointer shrink-0 z-30 touch-none select-none"
            title={isExpanded ? "아래로 접기" : "전체화면으로 확장"}
          >
            <div className="w-10 h-1.5 rounded-full bg-slate-300/80 hover:bg-slate-400 active:scale-95 transition-all" />
          </div>

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
                    onRetry={(q) => {
                      if (onRetry) {
                        onRetry();
                      } else {
                        const queryToSend = q || lastUserQuery;
                        if (queryToSend) {
                          onSendMessage(queryToSend);
                        }
                      }
                    }}
                    onChipClick={(chip) => onSendMessage(chip)}
                    onConfirmAction={(payload) => {
                      if (payload?.roomName) {
                        onSendMessage(
                          `${payload.roomName} ${payload.seatNo ? payload.seatNo + "번 " : ""}좌석 배정 신청을 진행해줘`
                        );
                      }
                    }}
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
          onClick={handleCapsuleClick}
          className="relative flex items-center justify-between px-4 py-2.5 rounded-full bg-white/95 border border-white/90 backdrop-blur-2xl shadow-[0_8px_28px_rgba(0,30,80,0.12)] text-slate-800 cursor-pointer transition-all duration-300 hover:shadow-[0_12px_36px_rgba(0,30,80,0.16)] active:scale-[0.99]"
        >
          {/* 좌측: 순수 챗불이 로고 + 상태 라벨 / 텍스트 입력창 */}
          <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
            <img
              src={chatbotLogo}
              alt="AI"
              className="w-6 h-6 object-contain shrink-0"
            />

            {isTextInputActive ? (
              <form onSubmit={handleTextSubmit} className="flex-1 flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="궁금한 내용을 입력하세요..."
                  className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder-slate-400"
                  autoFocus
                />
              </form>
            ) : (
              <div className="flex flex-col min-w-0">
                <span className="text-[14.5px] font-medium tracking-tight truncate text-slate-800">
                  {aiState === "listening" && "인천대학교 캠퍼스에 대해 무엇이든 물어보세요"}
                  {aiState === "recognized" && (recognizedText || "인식 완료")}
                  {aiState === "thinking" && "생각하는 중..."}
                  {aiState === "answering" && "답변 중..."}
                  {aiState === "expanded" && "질문을 추가로 입력하세요"}
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
            ) : aiState === "thinking" || aiState === "answering" ? (
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
