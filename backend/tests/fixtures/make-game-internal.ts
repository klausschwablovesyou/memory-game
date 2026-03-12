import type { GameInternal } from "../../src/modules/game/models/game-internal.model.ts";
import type { GameStatus } from "@shared/game/types/game-status.ts";

const playing: GameStatus = "playing";

export function makeGameInternal(id = "g1"): GameInternal {
  return {
    id,
    cards: [],
    settings: {
      username: "test",
      cardCount: 4,
      countdownSeconds: 60,
      flipBackDelayMs: 1000,
    },
    state: {
      status: playing,
      turns: 0,
      badGuesses: 0,
      matchedPairs: 0,
      startTime: Date.now(),
      currentFlipped: [],
    },
  };
}
