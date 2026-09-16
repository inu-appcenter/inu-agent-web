import React from "react";
import { GenerativeCard } from "../../types/agent";
import { MetricCard } from "./MetricCard";
import { StatusCard } from "./StatusCard";
import { ListCard } from "./ListCard";
import { ActionCard } from "./ActionCard";
import { ComponentCard } from "./ComponentCard";

interface Props {
  cards?: GenerativeCard[];
  onAction?: (actionId: string) => void;
  onConfirmAction?: (payload: Record<string, any>) => void;
}

export const CardRenderer: React.FC<Props> = ({ cards, onAction, onConfirmAction }) => {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="w-full space-y-3 my-3">
      {cards.map((card, idx) => {
        switch (card.card_type) {
          case "METRIC_CARD":
            return <MetricCard key={idx} data={card} />;
          case "STATUS_CARD":
            return <StatusCard key={idx} data={card} onAction={onAction} />;
          case "LIST_CARD":
            return <ListCard key={idx} data={card} />;
          case "ACTION_CARD":
            return (
              <ActionCard
                key={idx}
                data={card}
                onConfirm={onConfirmAction}
              />
            );
          case "COMPONENT_CARD":
            return (
              <ComponentCard
                key={idx}
                data={card}
                onAction={onAction}
                onConfirmAction={onConfirmAction}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
};
