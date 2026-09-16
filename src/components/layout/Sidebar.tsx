import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
  GraduationCap,
} from "lucide-react";
import { ChatRoom } from "../../types/agent";
import ChatbotLogo from "../../assets/chatbot-logo.svg";
import AppCenterLogo from "../../assets/텍스트O_블랙.png";

interface SidebarProps {
  isOpen: boolean;
  rooms: ChatRoom[];
  currentRoomId: string;
  onSelectRoom: (id: string) => void;
  onNewChat: () => void;
  onClearHistory: () => void;
  onDeleteRoom: (id: string) => void;
  onUpdateRoomTitle: (id: string, title: string) => void;
  onToggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  rooms,
  currentRoomId,
  onSelectRoom,
  onNewChat,
  onClearHistory,
  onDeleteRoom,
  onUpdateRoomTitle,
  onToggleSidebar,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const startEdit = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const saveEdit = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onUpdateRoomTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("이 대화방을 삭제할까요?")) {
      onDeleteRoom(id);
    }
  };

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40 flex-shrink-0 bg-white/75 backdrop-blur-xl border-r border-slate-200/60 flex flex-col transition-all duration-300 ease-in-out shadow-xl md:shadow-none select-none ${
        isOpen
          ? "w-[280px] translate-x-0 opacity-100 p-4 overflow-hidden"
          : "w-0 -translate-x-full opacity-0 pointer-events-none md:w-[68px] md:translate-x-0 md:opacity-100 md:pointer-events-auto md:py-2.5 md:px-2 md:overflow-visible"
      }`}
    >
      {isOpen ? (
        /* 1. 펼침 상태: 풀 사이즈 사이드바 (280px) */
        <div className="w-[248px] min-w-[248px] h-full flex flex-col transition-opacity duration-200 animate-in fade-in">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between w-full mb-4 px-1">
            <div className="flex items-center gap-2">
              <img src={ChatbotLogo} alt="챗불이 로고" className="w-8 h-8 object-contain" />
              <span className="text-base font-bold text-slate-800 tracking-tight">챗불이 에이전트</span>
            </div>
            <button
              onClick={onToggleSidebar}
              title="사이드바 닫기"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white/60 hover:bg-slate-100/80 text-slate-800 border border-slate-200/80 rounded-full font-semibold text-sm transition-all shadow-xs hover:shadow-sm mb-4 cursor-pointer"
          >
            <Plus size={16} />
            새로운 대화
          </button>

          {/* Room List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {rooms.map((room) => {
              const isActive = room.id === currentRoomId;
              const isEditing = editingId === room.id;

              return (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-2xl cursor-pointer text-xs transition-all ${
                    isActive
                      ? "bg-[#f0f4fa] text-[#0061ff] font-semibold"
                      : "text-slate-600 font-medium hover:bg-[#f0f4fa] hover:text-slate-900"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border ${
                      isActive
                        ? "bg-[#0061ff] text-white border-[#0061ff]"
                        : "bg-[#eff6ff] text-[#0061ff] border-[#bfdbfe]"
                    }`}
                  >
                    <GraduationCap size={12} />
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={inputRef}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(e, room.id)}
                        className="flex-1 min-w-0 bg-transparent text-xs border-b border-[#0061ff] outline-none py-0.5 text-slate-800"
                      />
                      <button onClick={(e) => saveEdit(e, room.id)} className="p-1 hover:text-[#0061ff]">
                        <Check size={12} />
                      </button>
                      <button onClick={cancelEdit} className="p-1 hover:text-slate-500">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 truncate">{room.title || "새로운 대화"}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => startEdit(e, room.id, room.title)}
                          title="제목 수정"
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-white"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, room.id)}
                          title="삭제"
                          className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-white"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="mt-3 pt-3 border-t border-slate-200/50 space-y-2">
            <button
              onClick={onClearHistory}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-medium text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              모든 대화 내역 삭제
            </button>

            <a
              href="https://home.inuappcenter.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center py-1 opacity-80 hover:opacity-100 transition-opacity"
            >
              <img src={AppCenterLogo} alt="앱센터 로고" className="h-6 object-contain" />
            </a>
          </div>
        </div>
      ) : (
        /* 2. 접힘 상태: 데스크톱 미니 세로 사이드바 (Gemini 스타일 레일) */
        <div className="w-full flex-1 flex flex-col items-center overflow-visible">
          {/* 상단 챗불이 로고 / 마우스 호버 시 사이드바 열기 버튼 */}
          <div className="h-[48px] flex items-center justify-center relative overflow-visible">
            <button
              onClick={onToggleSidebar}
              className="group relative w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-slate-100/90 text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
              aria-label="사이드바 열기"
            >
              {/* 평상시: 챗불이 로고 */}
              <img
                src={ChatbotLogo}
                alt="챗불이 로고"
                className="w-7 h-7 object-contain transition-all duration-150 group-hover:opacity-0 group-hover:scale-75 pointer-events-none"
              />
              {/* 마우스 호버 시: 펼침 아이콘 */}
              <PanelLeftOpen
                size={20}
                className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-all duration-150 text-slate-700 pointer-events-none"
              />
              {/* Gemini 스타일 플로팅 툴팁 라벨 (사이드바 열기) - Z-INDEX 70으로 헤더 위로 노출 */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-[70]">
                사이드바 열기
              </div>
            </button>
          </div>

          {/* 새 채팅 버튼 (상단 버튼 아래 조금 간격두고 배치 mt-3) */}
          <button
            onClick={onNewChat}
            className="group relative mt-3 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-slate-100 border border-slate-200/80 text-slate-700 hover:text-slate-900 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
            aria-label="새로운 대화"
          >
            <SquarePen size={18} />
            {/* Gemini 스타일 플로팅 툴팁 라벨 (새로운 대화) - Z-INDEX 70으로 헤더 위로 노출 */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-[70]">
              새로운 대화
            </div>
          </button>
        </div>
      )}
    </aside>
  );
};
