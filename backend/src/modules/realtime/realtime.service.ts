import { Injectable } from "@danet/core";

@Injectable()
export class RealtimeService {
  public handleConnection(
    socket: WebSocket,
    onMessage?: (data: string) => void,
  ): void {
    if (onMessage) {
      socket.onmessage = (event: MessageEvent): void => {
        onMessage(String(event.data));
      };
    }
  }

  public send(socket: WebSocket, data: unknown): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  }

  public close(socket: WebSocket): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  }
}
