import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Square } from "lucide-react";
import chatbotLogo from "../../assets/chatbot-logo.svg";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onStopGeneration?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  onExpand?: () => void;
  onClose?: () => void;
  onLogoClick?: () => void;
  isFloating?: boolean;
  className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStopGeneration,
  placeholder = "챗불이에게 물어보기",
  autoFocus = true,
  onExpand,
  onClose,
  onLogoClick,
  isFloating = false,
  className = "",
}) => {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && autoFocus) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, autoFocus]);

  const handleInputResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading) {
      onStopGeneration?.();
      return;
    }
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      handleSubmit();
    }
  };

  // Drag gestures on the floating input bar (drag up -> expand, drag down -> close)
  const dragStartYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  const handleContainerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "TEXTAREA" || target.tagName === "BUTTON" || target.tagName === "IMG") {
      return;
    }
    dragStartYRef.current = e.clientY;
    isDraggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleContainerPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const deltaY = e.clientY - dragStartYRef.current;
    if (deltaY < -30 && onExpand) {
      onExpand();
    } else if (deltaY > 35 && onClose) {
      onClose();
    } else {
      textareaRef.current?.focus();
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLogoClick) {
      onLogoClick();
    } else if (onExpand) {
      onExpand();
    }
  };

  return (
    <div
      style={
        isFloating
          ? undefined
          : {
              bottom:
                "max(16px, calc(var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 16px))",
            }
      }
      className={
        isFloating
          ? `w-full max-w-xl mx-auto pointer-events-auto relative z-20 ${className}`
          : `absolute left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[800px] z-20 flex flex-col gap-2 pointer-events-auto ${className}`
      }
    >
      <div
        onPointerDown={handleContainerPointerDown}
        onPointerUp={handleContainerPointerUp}
        className={`relative rounded-[24px] bg-gradient-to-t from-white/80 via-white/90 to-slate-100/80 backdrop-blur-xl shadow-[0px_4px_20px_rgba(0,30,80,0.10)] transition-all duration-300 border cursor-text ${
          isFocused ? "border-blue-500/50 shadow-blue-500/15" : "border-white/90 shadow-sm"
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="flex items-center bg-transparent rounded-[24px] py-1.5 pl-3.5 pr-2 w-full min-h-[52px] box-border"
        >
          {/* Left Chatbot Logo Button */}
          <button
            type="button"
            onClick={handleLogoClick}
            className="p-1 rounded-xl hover:bg-slate-100/60 active:scale-90 transition-transform cursor-pointer shrink-0 mr-2 flex items-center justify-center"
            title={onLogoClick || onExpand ? "전체화면으로 확장" : "챗불이 AI"}
          >
            <img
              src={chatbotLogo}
              alt="챗불이 로고"
              className="w-6 h-6 object-contain shrink-0 select-none pointer-events-none"
            />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleInputResize();
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "답변을 생성하고 있습니다..." : placeholder}
            disabled={isLoading}
            className="flex-1 bg-transparent border-0 outline-none text-[15px] font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-semibold resize-none max-h-[120px] leading-relaxed mr-2.5 self-center scrollbar-none"
          />

          <button
            type="submit"
            disabled={!isLoading && !input.trim()}
            title={isLoading ? "응답 중지" : "전송"}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              isLoading
                ? "bg-rose-500 text-white cursor-pointer hover:scale-105 active:scale-95 shadow-md shadow-rose-500/20"
                : input.trim().length > 0
                ? "bg-[#0061ff] text-white cursor-pointer hover:scale-105 active:scale-95 shadow-[0px_0px_10px_0px_rgba(145,206,255,0.7)]"
                : "bg-slate-300 text-white cursor-default"
            }`}
          >
            {isLoading ? (
              <Square size={15} fill="currentColor" />
            ) : (
              <ArrowRight size={19} strokeWidth={2.5} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
