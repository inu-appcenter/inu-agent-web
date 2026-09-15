import React from "react";
import { Sparkles, RotateCcw } from "lucide-react";

interface Props {
  clientTenant: string;
  onReset: () => void;
}

export const Header: React.FC<Props> = ({ clientTenant, onReset }) => {
  return (
    <header className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-bold text-slate-800 tracking-tight">
              INU Agent
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
              {clientTenant}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">인천대학교 AI 캠퍼스 비서</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Gemma 27B Engine
        </div>

        <button
          onClick={onReset}
          title="대화 초기화"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
