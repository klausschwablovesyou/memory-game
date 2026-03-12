import {
  WebSocketController,
  OnWebSocketMessage,
  WebSocket as WsDecorator,
  Body,
} from "@danet/core";
import { GameService } from "./game.service.ts";
import { GameTimerService } from "./game-timer.service.ts";
import { RealtimeService } from "@backend/modules/realtime/realtime.service.ts";

@WebSocketController("game-realtime")
export class GameRealtimeController {
  constructor(
    private readonly gameService: GameService,
    private readonly gameTimerService: GameTimerService,
    private readonly realtimeService: RealtimeService,
  ) {}

  @OnWebSocketMessage("timer/subscribe")
  public subscribeTimer(
    @WsDecorator socket: WebSocket,
    @Body() data: { gameId: string },
  ): void {
    const { gameId } = data;
    this.gameTimerService.stop(socket);

    const timerState = this.gameService.getTimerState(gameId);
    this.realtimeService.send(socket, { topic: "timer/tick", data: timerState });

    if (timerState.status !== "playing") {
      return;
    }

    const interval = setInterval(() => {
      if (socket.readyState !== globalThis.WebSocket.OPEN) {
        this.gameTimerService.stop(socket);
        return;
      }

      try {
        const state = this.gameService.getTimerState(gameId);
        this.realtimeService.send(socket, { topic: "timer/tick", data: state });

        if (state.status !== "playing") {
          this.gameTimerService.stop(socket);
          this.realtimeService.close(socket);
        }
      } catch {
        this.gameTimerService.stop(socket);
      }
    }, 1000);

    this.gameTimerService.set(socket, interval);
  }

  @OnWebSocketMessage("timer/unsubscribe")
  public unsubscribeTimer(@WsDecorator socket: WebSocket): void {
    this.gameTimerService.stop(socket);
  }
}
