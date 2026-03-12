import type { GameSettings } from "@shared/game/models/game-settings.model";

export const defaultSettings: GameSettings = {
  username: "test",
  cardCount: 4,
  countdownSeconds: 60,
  flipBackDelayMs: 1000,
};
