import { assertEquals } from "@std/assert";
import { GameService } from "../src/modules/game/game.service.ts";
import { GameRepository } from "../src/modules/game/game.repository.ts";
import { GameTimerService } from "../src/modules/game/game-timer.service.ts";
import { RealtimeService } from "../src/modules/realtime/realtime.service.ts";
import { GameRealtimeController } from "../src/modules/game/game-realtime.controller.ts";
import type { TimerState } from "@shared/game/models/timer-state.model.ts";
import { baseDto } from "./fixtures/base-dto.ts";
import { makeMockSocket } from "./fixtures/make-mock-socket.ts";

function makeSetup() {
  const gameService = new GameService(new GameRepository());
  const timerService = new GameTimerService();
  const realtimeService = new RealtimeService();
  const controller = new GameRealtimeController(gameService, timerService, realtimeService);
  return { gameService, timerService, realtimeService, controller };
}

Deno.test("subscribeTimer — sends initial timer tick immediately", () => {
  const { gameService, timerService, controller } = makeSetup();
  const game = gameService.createGame(baseDto);
  const socket = makeMockSocket();

  controller.subscribeTimer(socket, { gameId: game.gameId });

  assertEquals(socket._sent.length >= 1, true);
  const firstMsg = JSON.parse(socket._sent[0]);
  assertEquals(firstMsg.topic, "timer/tick");
  assertEquals(firstMsg.data.status, "playing");
  assertEquals(typeof firstMsg.data.remainingSeconds, "number");

  timerService.stop(socket);
});

Deno.test("subscribeTimer — does not start interval for expired game", () => {
  const { gameService, controller } = makeSetup();
  const game = gameService.createGame({ ...baseDto, countdownSeconds: 0 });
  // Trigger expiry
  gameService.getGame(game.gameId);
  const socket = makeMockSocket();

  controller.subscribeTimer(socket, { gameId: game.gameId });

  const msg = JSON.parse(socket._sent[0]);
  assertEquals(msg.data.status, "lost");
  // Only 1 message — no interval started
  assertEquals(socket._sent.length, 1);
});

Deno.test("subscribeTimer — stops previous timer before starting new one", () => {
  const { gameService, timerService, controller } = makeSetup();
  const game = gameService.createGame(baseDto);
  const socket = makeMockSocket();

  let stopCount = 0;
  const originalStop = timerService.stop.bind(timerService);
  timerService.stop = (s: WebSocket) => {
    if (s === socket) stopCount++;
    originalStop(s);
  };

  controller.subscribeTimer(socket, { gameId: game.gameId });
  controller.subscribeTimer(socket, { gameId: game.gameId });

  // stop is called once per subscribeTimer call
  assertEquals(stopCount, 2);

  // Cleanup
  timerService.stop(socket);
});

Deno.test("unsubscribeTimer — stops the timer for the socket", () => {
  const { gameService, controller, timerService } = makeSetup();
  const game = gameService.createGame(baseDto);
  const socket = makeMockSocket();

  controller.subscribeTimer(socket, { gameId: game.gameId });
  controller.unsubscribeTimer(socket);

  // Calling stop again should be safe (interval already cleared)
  timerService.stop(socket);
});

Deno.test("subscribeTimer — interval sends ticks for active game", async () => {
  const { gameService, controller, timerService } = makeSetup();
  const game = gameService.createGame(baseDto);
  const socket = makeMockSocket();

  controller.subscribeTimer(socket, { gameId: game.gameId });

  // Wait for one interval tick
  await new Promise((resolve) => setTimeout(resolve, 1100));

  // Should have initial + at least one interval tick
  assertEquals(socket._sent.length >= 2, true);

  const tickMsg = JSON.parse(socket._sent[1]) as { topic: string; data: TimerState };
  assertEquals(tickMsg.topic, "timer/tick");
  assertEquals(tickMsg.data.status, "playing");

  // Cleanup
  timerService.stop(socket);
});
