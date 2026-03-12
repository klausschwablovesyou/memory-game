import type { CreateGameDto } from "@shared/game/dtos/create-game.dto";
import type { TimerState } from "@shared/game/models/timer-state.model";
import { gameApiService } from "./game-api.service";
import { useGameStore } from "../store/game-store";
import { realtimeService } from "./realtime.service";

export class GameService {
  private unsubscribeTimer: (() => void) | null = null;

  public async startGame(dto: CreateGameDto): Promise<void> {
    const { setIsLoading, setGame, setError, setDisplayedSeconds } =
      useGameStore.getState();
    setIsLoading(true);
    setError(null);
    try {
      const game = await gameApiService.createGame(dto);
      setGame(game);
      setDisplayedSeconds(game.state.remainingSeconds);
      this.subscribeToTimer(game.gameId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start game");
    } finally {
      setIsLoading(false);
    }
  }

  public async flipCard(cardId: string): Promise<void> {
    const { game, isFlipLocked, setGame, setIsFlipLocked, setError, setDisplayedSeconds } =
      useGameStore.getState();
    if (!game || isFlipLocked) return;

    setIsFlipLocked(true);
    try {
      const updated = await gameApiService.flipCard(game.gameId, { cardId });
      setGame(updated);
      setDisplayedSeconds(updated.state.remainingSeconds);

      if (updated.state.pendingFlipBack) {
        setTimeout(() => {
          const { game: current, setGame: setCurrentGame, setIsFlipLocked: unlock } =
            useGameStore.getState();
          if (current) {
            setCurrentGame({
              ...current,
              board: current.board.map((c) =>
                c.isFaceUp && !c.isMatched
                  ? { ...c, isFaceUp: false, emoji: undefined }
                  : c,
              ),
              state: { ...current.state, pendingFlipBack: false },
            });
          }
          unlock(false);
        }, updated.settings.flipBackDelayMs);
      } else {
        setIsFlipLocked(false);
      }

      if (updated.state.status !== "playing") {
        this.unsubscribeFromTimer();
      }
    } catch (e) {
      setIsFlipLocked(false);
      setError(e instanceof Error ? e.message : "Failed to flip card");
    }
  }

  public async restartGame(): Promise<void> {
    const { game, setIsLoading, setGame, setError, setDisplayedSeconds } =
      useGameStore.getState();
    if (!game) return;

    setIsLoading(true);
    setError(null);
    try {
      const updated = await gameApiService.restartGame(game.gameId);
      setGame(updated);
      setDisplayedSeconds(updated.state.remainingSeconds);
      this.unsubscribeFromTimer();
      this.subscribeToTimer(updated.gameId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to restart game");
    } finally {
      setIsLoading(false);
    }
  }

  public async startGameWithSettings(dto: CreateGameDto): Promise<void> {
    this.unsubscribeFromTimer();
    realtimeService.disconnect();
    await this.startGame(dto);
  }

  public resetToSettings(): void {
    this.unsubscribeFromTimer();
    realtimeService.disconnect();
    const { setGame, setError, setIsFlipLocked, setDisplayedSeconds } =
      useGameStore.getState();
    setGame(null);
    setError(null);
    setIsFlipLocked(false);
    setDisplayedSeconds(0);
  }

  private async subscribeToTimer(gameId: string): Promise<void> {
    this.unsubscribeFromTimer();
    await realtimeService.connect("/game-realtime");
    this.unsubscribeTimer = realtimeService.subscribe(
      "timer/tick",
      (data: unknown): void => {
        const timerState = data as TimerState;
        const { game, setGame, setDisplayedSeconds } = useGameStore.getState();
        setDisplayedSeconds(timerState.remainingSeconds);

        if (timerState.status !== "playing" && game) {
          setGame({
            ...game,
            state: { ...game.state, status: timerState.status, remainingSeconds: timerState.remainingSeconds },
          });
          this.unsubscribeFromTimer();
        }
      },
    );
    realtimeService.send("timer/subscribe", { gameId });
  }

  private unsubscribeFromTimer(): void {
    if (this.unsubscribeTimer) {
      realtimeService.send("timer/unsubscribe", {});
      this.unsubscribeTimer();
      this.unsubscribeTimer = null;
    }
  }
}

export const gameService = new GameService();
