import type { GameStatus } from "@shared/game/types/game-status.ts";

export type GameStateInternal = {
  status: GameStatus;
  turns: number;
  badGuesses: number;
  matchedPairs: number;
  startTime: number;
  endTime?: number;
  currentFlipped: string[];
};
