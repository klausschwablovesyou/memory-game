export type CreateGameDto = {
  username: string;
  cardCount: number;
  countdownSeconds: number;
  flipBackDelayMs?: number;
  maxBadGuesses?: number;
};
