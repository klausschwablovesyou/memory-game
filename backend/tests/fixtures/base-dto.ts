import type { CreateGameDto } from "@shared/game/dtos/create-game.dto.ts";

export const baseDto: CreateGameDto = {
  username: "testuser",
  cardCount: 4,
  countdownSeconds: 60,
  flipBackDelayMs: 1000,
};
