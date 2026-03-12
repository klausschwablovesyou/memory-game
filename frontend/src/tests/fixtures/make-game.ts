import type { Game } from "@shared/game/models/game.model";
import { defaultBoard } from "./default-board";
import { defaultSettings } from "./default-settings";
import { defaultState } from "./default-state";

export function makeGame(overrides?: Partial<Game>): Game {
  return {
    gameId: "g1",
    board: defaultBoard,
    settings: defaultSettings,
    state: { ...defaultState, startTime: Date.now() },
    ...overrides,
  };
}
