import { assertEquals } from "@std/assert";
import { RealtimeService } from "../src/modules/realtime/realtime.service.ts";
import { makeMockSocket } from "./fixtures/make-mock-socket.ts";

Deno.test("send — sends JSON when socket is open", () => {
  const service = new RealtimeService();
  const socket = makeMockSocket(WebSocket.OPEN);

  service.send(socket, { topic: "test", data: 42 });

  const sent = (socket as unknown as { _sent: string[] })._sent;
  assertEquals(sent.length, 1);
  assertEquals(JSON.parse(sent[0]), { topic: "test", data: 42 });
});

Deno.test("send — does nothing when socket is not open", () => {
  const service = new RealtimeService();
  const socket = makeMockSocket(WebSocket.CLOSED);

  service.send(socket, { topic: "test", data: 42 });

  const sent = (socket as unknown as { _sent: string[] })._sent;
  assertEquals(sent.length, 0);
});

Deno.test("close — closes an open socket", () => {
  const service = new RealtimeService();
  const socket = makeMockSocket(WebSocket.OPEN);

  service.close(socket);

  assertEquals((socket as unknown as { _closed: boolean })._closed, true);
});

Deno.test("close — does nothing when socket is not open", () => {
  const service = new RealtimeService();
  const socket = makeMockSocket(WebSocket.CLOSED);

  service.close(socket);

  assertEquals((socket as unknown as { _closed: boolean })._closed, false);
});

Deno.test("handleConnection — sets onmessage handler when callback provided", () => {
  const service = new RealtimeService();
  const socket = makeMockSocket();
  const received: string[] = [];

  service.handleConnection(socket, (data) => received.push(data));

  // Simulate a message event
  const handler = socket.onmessage as ((event: MessageEvent) => void) | null;
  assertEquals(typeof handler, "function");

  handler!({ data: "hello" } as MessageEvent);
  assertEquals(received, ["hello"]);
});

Deno.test("handleConnection — does not set onmessage when no callback", () => {
  const service = new RealtimeService();
  const socket = makeMockSocket();

  service.handleConnection(socket);

  assertEquals(socket.onmessage, null);
});
