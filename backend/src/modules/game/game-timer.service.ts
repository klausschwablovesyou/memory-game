import { Injectable } from "@danet/core";

@Injectable()
export class GameTimerService {
  private readonly intervals = new Map<WebSocket, ReturnType<typeof setInterval>>();

  public set(socket: WebSocket, interval: ReturnType<typeof setInterval>): void {
    this.intervals.set(socket, interval);
  }

  public stop(socket: WebSocket): void {
    const interval = this.intervals.get(socket);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(socket);
    }
  }
}
