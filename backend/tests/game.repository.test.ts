import { assertEquals } from "@std/assert";
import { GameRepository } from "../src/modules/game/game.repository.ts";
import { makeGameInternal } from "./fixtures/make-game-internal.ts";

Deno.test("save and findById — stores and retrieves a game", () => {
  const repo = new GameRepository();
  const game = makeGameInternal();

  repo.save(game);
  const found = repo.findById("g1");

  assertEquals(found, game);
});

Deno.test("findById — returns undefined for unknown id", () => {
  const repo = new GameRepository();

  assertEquals(repo.findById("unknown"), undefined);
});

Deno.test("save — overwrites existing game with same id", () => {
  const repo = new GameRepository();
  const game = makeGameInternal();
  repo.save(game);

  game.state.turns = 5;
  repo.save(game);

  const found = repo.findById("g1");
  assertEquals(found?.state.turns, 5);
});

Deno.test("delete — removes a game", () => {
  const repo = new GameRepository();
  repo.save(makeGameInternal());

  repo.delete("g1");

  assertEquals(repo.findById("g1"), undefined);
});

Deno.test("delete — does nothing for unknown id", () => {
  const repo = new GameRepository();
  repo.save(makeGameInternal());

  repo.delete("unknown");

  assertEquals(repo.findById("g1")?.id, "g1");
});

Deno.test("save — stores multiple games independently", () => {
  const repo = new GameRepository();
  const game1 = makeGameInternal("g1");
  const game2 = makeGameInternal("g2");

  repo.save(game1);
  repo.save(game2);

  assertEquals(repo.findById("g1")?.id, "g1");
  assertEquals(repo.findById("g2")?.id, "g2");
});
