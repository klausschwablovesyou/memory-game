import { assertEquals } from "@std/assert";
import { DanetApplication } from "@danet/core";
import { AppModule } from "../src/app.module.ts";
import type { Game } from "@shared/game/models/game.model.ts";
import { baseDto } from "./fixtures/base-dto.ts";

let app: DanetApplication;
let baseUrl: string;

async function startApp(): Promise<void> {
  app = new DanetApplication();
  app.registerBasePath("/api");
  await app.init(AppModule);
  const port = 3100 + Math.floor(Math.random() * 900);
  await app.listen(port);
  baseUrl = `http://localhost:${port}/api`;
}

async function stopApp(): Promise<void> {
  await app.close();
}

async function postJson<T>(path: string, body: unknown): Promise<{ status: number; data: T }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function get<T>(path: string): Promise<{ status: number; data: T }> {
  const res = await fetch(`${baseUrl}${path}`);
  const data = await res.json();
  return { status: res.status, data };
}

Deno.test("API integration", async (t) => {
  await startApp();

  let gameId: string;
  let board: Game["board"];

  await t.step("POST /games — creates a new game", async () => {
    const { status, data } = await postJson<Game>("/games", baseDto);

    assertEquals(status, 200);
    assertEquals(typeof data.gameId, "string");
    assertEquals(data.board.length, 4);
    assertEquals(data.settings.username, baseDto.username);
    assertEquals(data.state.status, "playing");

    gameId = data.gameId;
    board = data.board;
  });

  await t.step("GET /games/:gameId — retrieves the game", async () => {
    const { status, data } = await get<Game>(`/games/${gameId}`);

    assertEquals(status, 200);
    assertEquals(data.gameId, gameId);
    assertEquals(data.board.length, 4);
  });

  await t.step("POST /games/:gameId/flip — flips a card", async () => {
    const cardId = board[0].id;
    const { status, data } = await postJson<Game>(`/games/${gameId}/flip`, { cardId });

    assertEquals(status, 200);
    const flipped = data.board.find((c) => c.id === cardId)!;
    assertEquals(flipped.isFaceUp, true);
    assertEquals(typeof flipped.emoji, "string");
  });

  await t.step("POST /games/:gameId/restart — restarts the game", async () => {
    const { status, data } = await postJson<Game>(`/games/${gameId}/restart`, {});

    assertEquals(status, 200);
    assertEquals(data.state.turns, 0);
    assertEquals(data.state.badGuesses, 0);
    assertEquals(data.state.matchedPairs, 0);
    assertEquals(data.state.status, "playing");
    assertEquals(data.board.every((c: { isFaceUp: boolean }) => !c.isFaceUp), true);
  });

  await t.step("POST /games — rejects odd cardCount", async () => {
    const res = await fetch(`${baseUrl}/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...baseDto, cardCount: 3 }),
    });

    assertEquals(res.status, 400);
    await res.body?.cancel();
  });

  await t.step("GET /games/:unknown — returns 404", async () => {
    const res = await fetch(`${baseUrl}/games/nonexistent`);

    assertEquals(res.status, 404);
    await res.body?.cancel();
  });

  await t.step("POST /games/:gameId/flip — returns 404 for unknown card", async () => {
    // Create a fresh game for this test
    const { data: game } = await postJson<Game>("/games", baseDto);
    const res = await fetch(`${baseUrl}/games/${game.gameId}/flip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: "nonexistent" }),
    });

    assertEquals(res.status, 404);
    await res.body?.cancel();
  });

  await stopApp();
});
