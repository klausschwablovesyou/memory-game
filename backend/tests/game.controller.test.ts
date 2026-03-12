import { assertEquals } from "@std/assert";
import { GameController } from "../src/modules/game/game.controller.ts";
import { GameService } from "../src/modules/game/game.service.ts";
import { GameRepository } from "../src/modules/game/game.repository.ts";
import type { Game } from "@shared/game/models/game.model.ts";
import { baseDto } from "./fixtures/base-dto.ts";

function makeController(): GameController {
  const service = new GameService(new GameRepository());
  return new GameController(service);
}

Deno.test("createGame — delegates to service and returns a game", () => {
  const controller = makeController();
  const game: Game = controller.createGame(baseDto);

  assertEquals(typeof game.gameId, "string");
  assertEquals(game.board.length, 4);
  assertEquals(game.settings.username, "testuser");
  assertEquals(game.state.status, "playing");
});

Deno.test("getGame — returns an existing game", () => {
  const controller = makeController();
  const created = controller.createGame(baseDto);

  const fetched = controller.getGame(created.gameId);

  assertEquals(fetched.gameId, created.gameId);
  assertEquals(fetched.board.length, 4);
});

Deno.test("flipCard — flips a card and returns updated game", () => {
  const controller = makeController();
  const game = controller.createGame(baseDto);
  const cardId = game.board[0].id;

  const updated = controller.flipCard(game.gameId, { cardId });

  const flipped = updated.board.find((c) => c.id === cardId)!;
  assertEquals(flipped.isFaceUp, true);
  assertEquals(typeof flipped.emoji, "string");
});

Deno.test("restartGame — resets game state", () => {
  const controller = makeController();
  const game = controller.createGame(baseDto);

  controller.flipCard(game.gameId, { cardId: game.board[0].id });
  const restarted = controller.restartGame(game.gameId);

  assertEquals(restarted.state.turns, 0);
  assertEquals(restarted.state.status, "playing");
  assertEquals(restarted.board.every((c) => !c.isFaceUp && !c.isMatched), true);
});
