import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  Mic,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  Copy,
  Share2,
  Check,
  Send,
  X,
  Maximize2,
  Square,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { AIState, ChatMessage } from "../../types/agent";
import { CardRenderer } from "../cards/CardRenderer";
import chatbotLogo from "../../assets/chatbot-logo.svg";

interface FloatingOverlayViewProps {
  aiState: AIState;
  setAiState: (state: AIState) => void;
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
  const [isCopied, setIsCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [isTextInputActive, setIsTextInputActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // 음성 인식 (Web Speech API)
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      setIsTextInputActive(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
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
          }, 500);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (aiState === "listening") {
          setIsTextInputActive(true);
        }
      };

      recognition.onend = () => {
        if (aiState === "listening" && !recognizedText) {
          setIsTextInputActive(true);
        }
      };

      recognition.start();
    } catch (e) {
      console.warn("Failed to start speech recognition:", e);
      setIsTextInputActive(true);
    }
  };

  const handleCapsuleClick = () => {
    if (aiState === "closed") {
      setAiState("listening");
      startSpeechRecognition();
    } else if (aiState === "listening") {
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
    setAiState("recognized");
    setTimeout(() => {
      onSendMessage(text);
    }, 300);
  };

  const handleCopy = async () => {
    if (!currentMessage?.content) return;
    try {
      await navigator.clipboard.writeText(currentMessage.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.warn("Copy failed:", err);
    }
  };

  const handleShare = async () => {
    if (!currentMessage?.content) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "인천대학교 챗불이 AI 답변",
          text: currentMessage.content,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  // 스트리밍 중 스크롤 오토스크롤
  useEffect(() => {
    if (aiState === "answering" || aiState === "expanded") {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }
  }, [currentMessage?.content, currentMessage?.cards, aiState]);

  if (aiState === "closed") {
    return null;
  }

  const isExpanded = aiState === "expanded";
  const isAnsweringOrExpanded = aiState === "answering" || aiState === "expanded";

  // Thinking 상태일 때 표시할 타임라인 스텝 목록 (이미지 3번 스타일)
  const thinkingTimeline = currentMessage?.timeline && currentMessage.timeline.length > 0
    ? currentMessage.timeline
    : [
        { id: "1", text: "AI로 답변을 생성하고 있습니다", state: "completed" },
        ...(recognizedText ? [{ id: "2", text: `${recognizedText}에 대한 정보 찾는 중`, state: "completed" }] : []),
        { id: "3", text: "지식을 종합하고 분석하는 중입니다", state: "running" },
      ];

  return (
    <div
      className={`fixed inset-0 w-full h-full flex flex-col justify-end pointer-events-none select-none transition-all duration-300 ${
        isExpanded ? "p-0" : "p-3 pb-3"
      }`}
    >
      {/* 1. Thinking 상태: 뒤쪽 확장 카드 (이미지 3번 스타일) */}
      {aiState === "thinking" && (
        <div className="w-full max-w-xl mx-auto mb-3 pointer-events-auto rounded-[32px] bg-[#eef3fb]/95 dark:bg-[#1a1d2d]/95 backdrop-blur-3xl border border-white/80 dark:border-white/10 shadow-[0_16px_40px_rgba(0,40,120,0.12)] p-5 animate-fade-in">
          {/* 수직 타임라인 진행 스텝 */}
          <div className="space-y-3.5 py-1">
            {thinkingTimeline.map((step, idx) => {
              const isLast = idx === thinkingTimeline.length - 1;
              const isRunning = step.state === "running" || isLast;
              return (
                <div key={step.id || idx} className="flex items-start gap-3">
                  {/* 스텝 연결 라인 & 아이콘 */}
                  <div className="relative flex flex-col items-center mt-0.5">
                    {isRunning ? (
                      <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 dark:border-slate-500 bg-transparent shrink-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                      </div>
                    )}
                    {!isLast && (
                      <div className="w-[1.5px] h-5 bg-slate-300 dark:bg-slate-700 my-0.5 border-dashed" />
                    )}
                  </div>

                  {/* 스텝 텍스트 */}
                  <span
                    className={`text-[13.5px] leading-snug tracking-tight ${
                      isRunning
                        ? "font-semibold text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-400"
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

      {/* 2. Answering & Expanded 상태: 본문 출력 카드 (이미지 4번 스타일) */}
      {isAnsweringOrExpanded && (
        <div
          className={`w-full max-w-xl mx-auto flex flex-col pointer-events-auto bg-[#f4f7fc]/95 dark:bg-[#161826]/95 backdrop-blur-3xl border border-white/90 dark:border-white/10 shadow-[0_20px_60px_rgba(0,30,90,0.18)] text-slate-900 dark:text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isExpanded
              ? "h-full rounded-none border-none pb-safe"
              : "rounded-[32px] max-h-[calc(100vh-120px)] mb-3 overflow-hidden"
          }`}
          style={{
            willChange: "height, transform",
          }}
        >
          {/* 상단 드래그 핸들 & 컨트롤 바 */}
          <div className="relative flex items-center justify-between px-5 pt-3 pb-2 border-b border-black/5 dark:border-white/5 shrink-0">
            {/* 상단 중앙 미니 핸들 바 */}
            <div
              onClick={isExpanded ? onCollapse : onExpand}
              className="absolute left-1/2 -translate-x-1/2 top-2.5 w-10 h-1.5 rounded-full bg-slate-400/40 dark:bg-white/30 cursor-pointer hover:bg-slate-500/60 active:scale-95 transition-all"
              title={isExpanded ? "아래로 접기" : "전체화면으로 확장"}
            />

            {/* 좌측: 타이틀 */}
            <div className="flex items-center gap-2 pt-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center p-0.5 shadow-sm">
                <img src={chatbotLogo} alt="챗불이" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-semibold tracking-tight text-slate-800 dark:text-slate-200">
                챗불이 AI
              </span>
            </div>

            {/* 우측: 확장/축소 및 닫기 버튼 */}
            <div className="flex items-center gap-1 pt-2">
              {isExpanded ? (
                <button
                  onClick={onCollapse}
                  className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
                  title="바텀시트로 축소"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onExpand}
                  className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
                  title="전체화면으로 확장"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 본문 스트리밍 및 출력 영역 */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-5 py-3.5 space-y-3 custom-scrollbar select-text text-sm leading-relaxed text-slate-800 dark:text-slate-100"
          >
            {/* 사용자 질문 리마인드 */}
            {recognizedText && (
              <div className="flex justify-end mb-2">
                <div className="max-w-[85%] px-3.5 py-2 rounded-2xl bg-blue-500/10 dark:bg-blue-600/30 border border-blue-500/20 text-blue-950 dark:text-blue-100 text-xs sm:text-sm font-medium">
                  {recognizedText}
                </div>
              </div>
            )}

            {/* 마크다운 답변 텍스트 */}
            {currentMessage?.content ? (
              <div className="chat-markdown prose-slate dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {currentMessage.content}
                </ReactMarkdown>
                {currentMessage.isStreaming && (
                  <span className="inline-block w-1.5 h-4 bg-blue-600 dark:bg-blue-400 animate-pulse ml-1 align-middle" />
                )}
              </div>
            ) : currentMessage?.isStreaming ? (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs py-2">
                <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                <span>답변을 생성하고 있습니다...</span>
              </div>
            ) : null}

            {/* SDUI 제너레이티브 카드 렌더러 */}
            {currentMessage?.cards && currentMessage.cards.length > 0 && (
              <div className="pt-2">
                <CardRenderer
                  cards={currentMessage.cards}
                  onConfirmAction={(payload) => {
                    if (payload?.roomName) {
                      onSendMessage(
                        `${payload.roomName} ${payload.seatNo ? payload.seatNo + "번 " : ""}좌석 배정을 진행해줘`
                      );
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* 하단 5개 액션 아이콘 툴바 (재질문, 싫어요, 좋아요, 복사, 공유) */}
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-black/20 shrink-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={onRetry}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
                title="다시 답변 요청"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">재질문</span>
              </button>
              <button
                onClick={() => setLiked(liked === false ? null : false)}
                className={`p-1.5 rounded-lg text-xs transition-all active:scale-95 ${
                  liked === false
                    ? "text-red-500 bg-red-500/15"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
                }`}
                title="답변이 마음에 들지 않아요"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLiked(liked === true ? null : true)}
                className={`p-1.5 rounded-lg text-xs transition-all active:scale-95 ${
                  liked === true
                    ? "text-blue-600 bg-blue-600/15"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
                }`}
                title="답변이 마음에 들어요"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
                title="답변 복사"
              >
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline text-[11px]">
                  {isCopied ? "복사됨" : "복사"}
                </span>
              </button>
              <button
                onClick={handleShare}
                className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
                title="공유하기"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Floating Capsule (하단 도킹 알약 캡슐 - 이미지 2, 3, 4번 공통) */}
      <div className="w-full max-w-xl mx-auto pointer-events-auto relative">
        {/* 외부 앰비언트 글로우 테두리 (Listening / Recognized 시 영롱한 네온 링) */}
        {(aiState === "listening" || aiState === "recognized") && (
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-60 blur-md animate-pulse pointer-events-none" />
        )}

        <div
          onClick={handleCapsuleClick}
          className="relative flex items-center justify-between px-4 py-2.5 rounded-full bg-white/95 dark:bg-[#1a1d2e]/95 border border-white dark:border-white/15 backdrop-blur-2xl shadow-[0_10px_32px_rgba(0,30,80,0.16)] text-slate-800 dark:text-white cursor-pointer transition-all duration-300 hover:shadow-[0_14px_40px_rgba(0,30,80,0.22)] active:scale-[0.99]"
        >
          {/* 상단 미니 바 (Listening 상태일 때 알약 상단 핸들) */}
          {aiState === "listening" && (
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          )}

          {/* 좌측: 로고 구체 + 상태 라벨 / 텍스트 입력창 */}
          <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center p-1 shadow-md shadow-blue-500/25 shrink-0">
              <img src={chatbotLogo} alt="AI" className="w-full h-full object-contain" />
              {aiState === "listening" && (
                <div className="absolute inset-0 rounded-full border border-cyan-300 animate-ping opacity-75 pointer-events-none" />
              )}
            </div>

            {isTextInputActive ? (
              <form onSubmit={handleTextSubmit} className="flex-1 flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="궁금한 내용을 입력하세요..."
                  className="w-full bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400"
                  autoFocus
                />
              </form>
            ) : (
              <div className="flex flex-col min-w-0">
                <span className="text-[14.5px] font-semibold tracking-tight truncate text-slate-800 dark:text-slate-100">
                  {aiState === "listening" && "듣는 중..."}
                  {aiState === "recognized" && (recognizedText || "인식 완료")}
                  {aiState === "thinking" && "생각하는 중..."}
                  {aiState === "answering" && "답변 중..."}
                  {aiState === "expanded" && "질문을 추가로 입력하거나 대화하세요"}
                </span>
                {aiState === "listening" && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    탭하여 키보드로 직접 입력
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 우측: 이퀄라이저 파형 or 정지 버튼 + 마이크 */}
          <div className="flex items-center gap-2 shrink-0">
            {isTextInputActive ? (
              <button
                onClick={handleTextSubmit}
                disabled={!inputText.trim()}
                className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            ) : aiState === "thinking" ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAiState("listening");
                  }}
                  className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-95"
                  title="생성 중지"
                >
                  <Square className="w-2.5 h-2.5 fill-current" />
                </button>
                <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            ) : aiState === "answering" ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAiState("listening");
                  }}
                  className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-95"
                  title="답변 중지"
                >
                  <Square className="w-2.5 h-2.5 fill-current" />
                </button>
                {/* 컬러풀 사운드 파형 */}
                <div className="flex items-center gap-1 h-5 px-1">
                  <span className="w-1 bg-purple-500 rounded-full animate-bounce h-2.5" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 bg-blue-500 rounded-full animate-bounce h-5" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 bg-cyan-500 rounded-full animate-bounce h-3.5" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            ) : aiState === "listening" ? (
              /* 컬러풀 Equalizer 파형 (이미지 2번 스타일: 보라-블루-시안) */
              <div className="flex items-center gap-1 h-5 px-1">
                <span className="w-1 bg-purple-500 rounded-full animate-bounce h-2.5" style={{ animationDelay: "0ms" }} />
                <span className="w-1 bg-blue-500 rounded-full animate-bounce h-5" style={{ animationDelay: "150ms" }} />
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-3.5" style={{ animationDelay: "300ms" }} />
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAiState("listening");
                  startSpeechRecognition();
                }}
                className="p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-600 active:scale-95 transition-all"
                title="음성으로 질문하기"
              >
                <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
