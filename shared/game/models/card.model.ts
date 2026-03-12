export type Card = {
  id: string;
  isFaceUp: boolean;
  isMatched: boolean;
  /** Only present when the card is face-up or matched */
  emoji?: string;
};
