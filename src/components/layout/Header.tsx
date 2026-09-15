import React from "react";
import { PanelLeftOpen, SquarePen, Sparkles } from "lucide-react";

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  clientTenant?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  onNewChat,
  clientTenant = "INTIP",
}) => {
  return (
    <header className="sticky top-0 z-30 w-full h-[60px] px-4 md:px-6 flex items-center justify-between border-b border-white/40 bg-white/20 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            title="사이드바 열기"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white/60 rounded-xl transition-all shadow-2xs"
          >
            <PanelLeftOpen size={20} />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xs text-white">
            <Sparkles size={14} />
          </div>
          <h1 className="text-base font-bold text-slate-800 tracking-tight">인팁 비서</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-700 border border-blue-200/80 uppercase tracking-wider">
            {clientTenant}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          title="새로운 대화"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white/60 rounded-xl transition-all"
        >
          <SquarePen size={20} />
        </button>
      </div>
    </header>
  );
};
