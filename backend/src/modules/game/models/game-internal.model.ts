import type { GameSettings } from "@shared/game/models/game-settings.model.ts";
import type { CardInternal } from "./card-internal.model.ts";
import type { GameStateInternal } from "./game-state-internal.model.ts";

export type GameInternal = {
  id: string;
  cards: CardInternal[];
  settings: GameSettings;
  state: GameStateInternal;
};
