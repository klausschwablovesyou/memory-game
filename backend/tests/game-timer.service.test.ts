import { assertEquals } from "@std/assert";
import { GameTimerService } from "../src/modules/game/game-timer.service.ts";
import { makeMockSocket } from "./fixtures/make-mock-socket.ts";

Deno.test("set and stop — stores and clears an interval", () => {
  const service = new GameTimerService();
  const socket = makeMockSocket();
  let cleared = false;

  const interval = setInterval(() => {}, 10000);
  const originalClearInterval = globalThis.clearInterval;
  globalThis.clearInterval = ((id: ReturnType<typeof setInterval>) => {
    if (id === interval) cleared = true;
    originalClearInterval(id);
  }) as typeof clearInterval;

  service.set(socket, interval);
  service.stop(socket);

  assertEquals(cleared, true);

  globalThis.clearInterval = originalClearInterval;
});

Deno.test("stop — does nothing for unknown socket", () => {
  const service = new GameTimerService();
  const socket = makeMockSocket();

  // Should not throw
  service.stop(socket);
});

Deno.test("stop — only clears the interval for the given socket", () => {
  const service = new GameTimerService();
  const socket1 = makeMockSocket();
  const socket2 = makeMockSocket();
  let cleared1 = false;
  let cleared2 = false;

  const interval1 = setInterval(() => {}, 10000);
  const interval2 = setInterval(() => {}, 10000);

  const originalClearInterval = globalThis.clearInterval;
  globalThis.clearInterval = ((id: ReturnType<typeof setInterval>) => {
    if (id === interval1) cleared1 = true;
    if (id === interval2) cleared2 = true;
    originalClearInterval(id);
  }) as typeof clearInterval;

  service.set(socket1, interval1);
  service.set(socket2, interval2);
  service.stop(socket1);

  assertEquals(cleared1, true);
  assertEquals(cleared2, false);

  // Cleanup
  service.stop(socket2);
  globalThis.clearInterval = originalClearInterval;
});

Deno.test("stop — can be called twice without error", () => {
  const service = new GameTimerService();
  const socket = makeMockSocket();
  const interval = setInterval(() => {}, 10000);

  service.set(socket, interval);
  service.stop(socket);
  service.stop(socket);

  // Should not throw
  clearInterval(interval);
});
