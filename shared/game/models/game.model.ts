import type { LastAction } from "../types/last-action.ts";
import type { Card } from "./card.model.ts";
import type { GameSettings } from "./game-settings.model.ts";
import type { GameState } from "./game-state.model.ts";

export type Game = {
  gameId: string;
  board: Card[];
  settings: GameSettings;
  state: GameState;
  lastAction?: LastAction;
};
