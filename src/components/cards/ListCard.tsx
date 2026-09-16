import React from "react";
import { ListCardData } from "../../types/agent";
import { ListTodo, ChevronRight } from "lucide-react";

import { handleAppNavigation } from "../../utils/navigation";

interface Props {
  data: ListCardData;
}

export const ListCard: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm md:text-base pb-3 border-b border-slate-100">
        <ListTodo className="w-4 h-4 text-blue-600" />
        {data.title}
      </div>

      <div className="divide-y divide-slate-50 py-1">
        {data.items.map((item, idx) => {
          const isClickable = Boolean(item.link);
          return (
            <div
              key={idx}
              onClick={() => isClickable && handleAppNavigation(item.link)}
              className={`py-2.5 px-2 flex items-center justify-between rounded-xl transition-colors ${
                isClickable
                  ? "hover:bg-blue-50/60 cursor-pointer"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="pr-3 min-w-0 flex-1">
                <div
                  className={`text-xs md:text-sm font-medium line-clamp-1 ${
                    isClickable ? "text-blue-950 hover:text-blue-600" : "text-slate-800"
                  }`}
                >
                  {item.title}
                </div>
                {item.subtitle && (
                  <div className="text-[11px] text-slate-400 mt-0.5 break-all line-clamp-2 md:line-clamp-1 overflow-hidden">
                    {item.subtitle}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.tag && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {item.tag}
                  </span>
                )}
                {item.link && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
              </div>
            </div>
          );
        })}
      </div>

      {data.footer_text && (
        <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 text-right">
          {data.footer_text}
        </div>
      )}
    </div>
  );
};
