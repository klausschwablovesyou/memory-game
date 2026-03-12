import { RealtimeService } from "../realtime.service";

class MockWebSocket {
  static OPEN = 1;
  readyState = MockWebSocket.OPEN;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  sent: string[] = [];
  closed = false;

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.closed = true;
  }

  simulateOpen() {
    this.onopen?.();
  }

  simulateMessage(topic: string, data: unknown) {
    this.onmessage?.({ data: JSON.stringify({ topic, data }) } as MessageEvent);
  }

  simulateError() {
    this.onerror?.();
  }
}

let lastCreatedSocket: MockWebSocket;

beforeEach(() => {
  vi.stubGlobal("WebSocket", class extends MockWebSocket {
    constructor() {
      super();
      lastCreatedSocket = this;
    }
  });
  // Provide WebSocket.OPEN for the readyState check
  (globalThis.WebSocket as unknown as { OPEN: number }).OPEN = 1;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("RealtimeService", () => {
  describe("connect", () => {
    it("resolves when socket opens", async () => {
      const service = new RealtimeService();
      const promise = service.connect("/test");
      lastCreatedSocket.simulateOpen();
      await expect(promise).resolves.toBeUndefined();
    });

    it("rejects when socket errors", async () => {
      const service = new RealtimeService();
      const promise = service.connect("/test");
      lastCreatedSocket.simulateError();
      await expect(promise).rejects.toThrow("WebSocket connection failed");
    });

    it("closes previous socket on reconnect", async () => {
      const service = new RealtimeService();

      const p1 = service.connect("/first");
      const firstSocket = lastCreatedSocket;
      firstSocket.simulateOpen();
      await p1;

      const p2 = service.connect("/second");
      expect(firstSocket.closed).toBe(true);
      lastCreatedSocket.simulateOpen();
      await p2;
    });
  });

  describe("subscribe", () => {
    it("delivers messages to matching topic handlers", async () => {
      const service = new RealtimeService();
      const promise = service.connect("/test");
      lastCreatedSocket.simulateOpen();
      await promise;

      const handler = vi.fn();
      service.subscribe("timer/tick", handler);

      lastCreatedSocket.simulateMessage("timer/tick", { remaining: 30 });

      expect(handler).toHaveBeenCalledWith({ remaining: 30 });
    });

    it("does not deliver messages to unrelated topics", async () => {
      const service = new RealtimeService();
      const promise = service.connect("/test");
      lastCreatedSocket.simulateOpen();
      await promise;

      const handler = vi.fn();
      service.subscribe("timer/tick", handler);

      lastCreatedSocket.simulateMessage("other/topic", { data: 1 });

      expect(handler).not.toHaveBeenCalled();
    });

    it("returns unsubscribe function that removes handler", async () => {
      const service = new RealtimeService();
      const promise = service.connect("/test");
      lastCreatedSocket.simulateOpen();
      await promise;

      const handler = vi.fn();
      const unsubscribe = service.subscribe("timer/tick", handler);

      unsubscribe();
      lastCreatedSocket.simulateMessage("timer/tick", { remaining: 30 });

      expect(handler).not.toHaveBeenCalled();
    });

    it("ignores malformed messages", async () => {
      const service = new RealtimeService();
      const promise = service.connect("/test");
      lastCreatedSocket.simulateOpen();
      await promise;

      const handler = vi.fn();
      service.subscribe("timer/tick", handler);

      lastCreatedSocket.onmessage?.({ data: "not json" } as MessageEvent);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("send", () => {
    it("sends JSON message when socket is open", async () => {
      const service = new RealtimeService();
      const promise = service.connect("/test");
      lastCreatedSocket.simulateOpen();
      await promise;

      service.send("timer/subscribe", { gameId: "g1" });

      expect(lastCreatedSocket.sent).toEqual([
        JSON.stringify({ topic: "timer/subscribe", data: { gameId: "g1" } }),
      ]);
    });

    it("does nothing when socket is not connected", () => {
      const service = new RealtimeService();
      // No connect call
      expect(() => service.send("topic", {})).not.toThrow();
    });
  });

  describe("disconnect", () => {
    it("closes the socket", async () => {
      const service = new RealtimeService();
      const promise = service.connect("/test");
      lastCreatedSocket.simulateOpen();
      await promise;

      const socket = lastCreatedSocket;
      service.disconnect();
      expect(socket.closed).toBe(true);
    });

    it("does nothing when not connected", () => {
      const service = new RealtimeService();
      expect(() => service.disconnect()).not.toThrow();
    });
  });
});
