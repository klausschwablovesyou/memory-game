import { GameService } from "../game.service";
import { gameApiService } from "../game-api.service";
import { realtimeService } from "../realtime.service";
import { useGameStore } from "../../store/game-store";
import { makeGame } from "../../tests/fixtures/make-game";
import { defaultStoreState } from "../../tests/fixtures/default-store-state";

vi.mock("../game-api.service", () => ({
  gameApiService: {
    createGame: vi.fn(),
    flipCard: vi.fn(),
    restartGame: vi.fn(),
  },
}));

vi.mock("../realtime.service", () => ({
  realtimeService: {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn(),
    subscribe: vi.fn().mockReturnValue(vi.fn()),
    send: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  useGameStore.setState(defaultStoreState);
});

describe("GameService", () => {
  describe("startGame", () => {
    it("sets game and displayedSeconds on success", async () => {
      const game = makeGame();
      vi.mocked(gameApiService.createGame).mockResolvedValue(game);

      const service = new GameService();
      await service.startGame({ username: "test", cardCount: 4, countdownSeconds: 60 });

      const state = useGameStore.getState();
      expect(state.game).toBe(game);
      expect(state.displayedSeconds).toBe(60);
      expect(state.isLoading).toBe(false);
    });

    it("sets error on failure", async () => {
      vi.mocked(gameApiService.createGame).mockRejectedValue(new Error("Server error"));

      const service = new GameService();
      await service.startGame({ username: "test", cardCount: 4, countdownSeconds: 60 });

      const state = useGameStore.getState();
      expect(state.game).toBeNull();
      expect(state.error).toBe("Server error");
      expect(state.isLoading).toBe(false);
    });

    it("subscribes to timer after game creation", async () => {
      const game = makeGame();
      vi.mocked(gameApiService.createGame).mockResolvedValue(game);

      const service = new GameService();
      await service.startGame({ username: "test", cardCount: 4, countdownSeconds: 60 });

      expect(realtimeService.connect).toHaveBeenCalledWith("/game-realtime");
      expect(realtimeService.subscribe).toHaveBeenCalledWith("timer/tick", expect.any(Function));
      expect(realtimeService.send).toHaveBeenCalledWith("timer/subscribe", { gameId: "g1" });
    });
  });

  describe("flipCard", () => {
    it("does nothing when no game exists", async () => {
      const service = new GameService();
      await service.flipCard("c1");

      expect(gameApiService.flipCard).not.toHaveBeenCalled();
    });

    it("does nothing when flip is locked", async () => {
      useGameStore.setState({ game: makeGame(), isFlipLocked: true });

      const service = new GameService();
      await service.flipCard("c1");

      expect(gameApiService.flipCard).not.toHaveBeenCalled();
    });

    it("updates game state on successful flip", async () => {
      const game = makeGame();
      const updated = makeGame({
        board: [
          { id: "c1", isFaceUp: true, isMatched: false, emoji: "🐶" },
          { id: "c2", isFaceUp: false, isMatched: false },
        ],
      });
      useGameStore.setState({ game });
      vi.mocked(gameApiService.flipCard).mockResolvedValue(updated);

      const service = new GameService();
      await service.flipCard("c1");

      expect(useGameStore.getState().game).toBe(updated);
      expect(useGameStore.getState().isFlipLocked).toBe(false);
    });

    it("schedules flip-back when pendingFlipBack is true", async () => {
      vi.useFakeTimers();
      const game = makeGame();
      const updated = makeGame({
        board: [
          { id: "c1", isFaceUp: true, isMatched: false, emoji: "🐶" },
          { id: "c2", isFaceUp: true, isMatched: false, emoji: "🐱" },
        ],
        state: {
          ...game.state,
          pendingFlipBack: true,
        },
      });
      useGameStore.setState({ game });
      vi.mocked(gameApiService.flipCard).mockResolvedValue(updated);

      const service = new GameService();
      await service.flipCard("c1");

      expect(useGameStore.getState().isFlipLocked).toBe(true);

      vi.advanceTimersByTime(1000);

      const state = useGameStore.getState();
      expect(state.isFlipLocked).toBe(false);
      expect(state.game?.board.every((c) => !c.isFaceUp)).toBe(true);
      expect(state.game?.state.pendingFlipBack).toBe(false);

      vi.useRealTimers();
    });

    it("sets error on flip failure", async () => {
      useGameStore.setState({ game: makeGame() });
      vi.mocked(gameApiService.flipCard).mockRejectedValue(new Error("Flip failed"));

      const service = new GameService();
      await service.flipCard("c1");

      expect(useGameStore.getState().error).toBe("Flip failed");
      expect(useGameStore.getState().isFlipLocked).toBe(false);
    });
  });

  describe("restartGame", () => {
    it("does nothing when no game exists", async () => {
      const service = new GameService();
      await service.restartGame();

      expect(gameApiService.restartGame).not.toHaveBeenCalled();
    });

    it("resets game state on success", async () => {
      const game = makeGame();
      const restarted = makeGame({ gameId: "g2" });
      useGameStore.setState({ game });
      vi.mocked(gameApiService.restartGame).mockResolvedValue(restarted);

      const service = new GameService();
      await service.restartGame();

      const state = useGameStore.getState();
      expect(state.game).toBe(restarted);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("startGameWithSettings", () => {
    it("disconnects realtime and starts a new game", async () => {
      const game = makeGame();
      vi.mocked(gameApiService.createGame).mockResolvedValue(game);

      const service = new GameService();
      await service.startGameWithSettings({ username: "test", cardCount: 4, countdownSeconds: 60 });

      expect(realtimeService.disconnect).toHaveBeenCalled();
      expect(gameApiService.createGame).toHaveBeenCalled();
    });
  });

  describe("resetToSettings", () => {
    it("clears all game state", () => {
      useGameStore.setState({
        game: makeGame(),
        displayedSeconds: 45,
        isFlipLocked: true,
        error: "some error",
      });

      const service = new GameService();
      service.resetToSettings();

      const state = useGameStore.getState();
      expect(state.game).toBeNull();
      expect(state.displayedSeconds).toBe(0);
      expect(state.isFlipLocked).toBe(false);
      expect(state.error).toBeNull();
      expect(realtimeService.disconnect).toHaveBeenCalled();
    });
  });
});
