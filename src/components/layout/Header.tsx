import React from "react";
import { PanelLeftOpen } from "lucide-react";

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat?: () => void;
  clientTenant?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
}) => {
  return (
    <header
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      className="sticky top-0 z-30 w-full min-h-[60px] px-4 md:px-6 flex items-center justify-between border-b border-white/40 bg-white/20 backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            title="사이드바 열기"
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-white/60 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <PanelLeftOpen size={20} />
          </button>
        )}
        <h1 className="text-base font-bold text-slate-800 tracking-tight">챗불이 에이전트</h1>
      </div>

      <div className="flex items-center gap-2" />
    </header>
  );
};

