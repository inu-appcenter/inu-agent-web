import React from "react";
import { ActionCardData } from "../../types/agent";
import { Check, X, AlertCircle } from "lucide-react";

interface Props {
  data: ActionCardData;
  onConfirm?: (payload: Record<string, any>) => void;
  onCancel?: () => void;
}

export const ActionCard: React.FC<Props> = ({ data, onConfirm, onCancel }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-blue-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm md:text-base pb-2">
        <AlertCircle className="w-4 h-4 text-blue-600" />
        {data.title}
      </div>

      <p className="text-xs text-slate-600 leading-relaxed py-2">
        {data.description}
      </p>

      <div className="flex gap-2 pt-3 border-t border-slate-100 mt-2">
        {data.cancel_label && (
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            {data.cancel_label}
          </button>
        )}
        <button
          onClick={() => onConfirm?.(data.action_payload)}
          className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-sm"
        >
          <Check className="w-3.5 h-3.5" />
          {data.confirm_label}
        </button>
      </div>
    </div>
  );
};
