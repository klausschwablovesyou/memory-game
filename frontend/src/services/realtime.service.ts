type MessageHandler = (data: unknown) => void;

export class RealtimeService {
  private socket: WebSocket | null = null;
  private readonly subscribers = new Map<string, Set<MessageHandler>>();

  public connect(url: string): Promise<void> {
    this.disconnect();

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    this.socket = new WebSocket(`${protocol}//${window.location.host}${url}`);

    this.socket.onmessage = (event: MessageEvent): void => {
      try {
        const { topic, data } = JSON.parse(event.data);
        const handlers = this.subscribers.get(topic);
        if (handlers) {
          handlers.forEach((handler) => handler(data));
        }
      } catch {
        // ignore malformed messages
      }
    };

    return new Promise<void>((resolve, reject) => {
      this.socket!.onopen = (): void => resolve();
      this.socket!.onerror = (): void => reject(new Error("WebSocket connection failed"));
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public subscribe(topic: string, handler: MessageHandler): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic)!.add(handler);

    return (): void => {
      this.subscribers.get(topic)?.delete(handler);
    };
  }

  public send(topic: string, data: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ topic, data }));
    }
  }
}

export const realtimeService = new RealtimeService();
