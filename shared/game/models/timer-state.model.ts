import type { GameStatus } from "@shared/game/types/game-status";

export type TimerState = {
  remainingSeconds: number;
  status: GameStatus;
};
