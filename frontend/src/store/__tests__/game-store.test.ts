import { useGameStore } from "../game-store";
import { makeGame } from "../../tests/fixtures/make-game";
import { defaultStoreState } from "../../tests/fixtures/default-store-state";

beforeEach(() => {
  useGameStore.setState(defaultStoreState);
});

describe("game-store", () => {
  it("has correct initial state", () => {
    const state = useGameStore.getState();
    expect(state.game).toBeNull();
    expect(state.displayedSeconds).toBe(0);
    expect(state.isLoading).toBe(false);
    expect(state.isFlipLocked).toBe(false);
    expect(state.error).toBeNull();
    expect(state.showSettings).toBe(false);
  });

  it("setGame updates game", () => {
    const game = makeGame();
    useGameStore.getState().setGame(game);
    expect(useGameStore.getState().game).toBe(game);
  });

  it("setGame can set null", () => {
    useGameStore.getState().setGame(makeGame());
    useGameStore.getState().setGame(null);
    expect(useGameStore.getState().game).toBeNull();
  });

  it("setDisplayedSeconds updates displayedSeconds", () => {
    useGameStore.getState().setDisplayedSeconds(42);
    expect(useGameStore.getState().displayedSeconds).toBe(42);
  });

  it("setIsLoading updates isLoading", () => {
    useGameStore.getState().setIsLoading(true);
    expect(useGameStore.getState().isLoading).toBe(true);
  });

  it("setIsFlipLocked updates isFlipLocked", () => {
    useGameStore.getState().setIsFlipLocked(true);
    expect(useGameStore.getState().isFlipLocked).toBe(true);
  });

  it("setError updates error", () => {
    useGameStore.getState().setError("Something broke");
    expect(useGameStore.getState().error).toBe("Something broke");
  });

  it("setShowSettings updates showSettings", () => {
    useGameStore.getState().setShowSettings(true);
    expect(useGameStore.getState().showSettings).toBe(true);
  });
});
