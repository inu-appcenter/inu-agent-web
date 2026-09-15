import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Sparkles } from "lucide-react";

interface Props {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const PromptInput: React.FC<Props> = ({ onSend, isLoading }) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white border border-slate-200/90 rounded-3xl shadow-lg shadow-slate-200/40 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all p-2 flex items-end gap-2"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="인천대 학식, 버스, 시간표, LMS 과제, 도서관을 물어보세요..."
          disabled={isLoading}
          className="w-full resize-none max-h-32 px-4 py-2.5 bg-transparent border-0 focus:outline-none text-sm text-slate-800 placeholder:text-slate-400 leading-relaxed"
        />

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
            text.trim() && !isLoading
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <Sparkles className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
        </button>
      </form>

      <div className="text-center mt-2 text-[11px] text-slate-400 font-medium">
        INU AI Agent는 인천대학교 공식 학사 및 생활 정보를 바탕으로 답변합니다.
      </div>
    </div>
  );
};
