import type { Card } from "@shared/game/models/card.model";

export type GameCardProps = {
  card: Card;
  disabled: boolean;
  onClick: (cardId: string) => void;
};
