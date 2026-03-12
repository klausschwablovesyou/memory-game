import type { GameState } from "@shared/game/models/game-state.model";
import type { GameStatus } from "@shared/game/types/game-status";

export const defaultState: GameState = {
  status: "playing" as GameStatus,
  turns: 0,
  badGuesses: 0,
  matchedPairs: 0,
  remainingSeconds: 60,
  startTime: 0,
  pendingFlipBack: false,
};
