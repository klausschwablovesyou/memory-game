import type { GameStatus } from "../types/game-status.ts";

export type GameState = {
  status: GameStatus;
  turns: number;
  badGuesses: number;
  matchedPairs: number;
  remainingSeconds: number;
  startTime: number;
  /** True when two mismatched cards are face-up, waiting for the flip-back delay */
  pendingFlipBack: boolean;
};
