import { render, screen } from "@testing-library/react";
import { App } from "../../App";
import { useGameStore } from "../../store/game-store";
import { makeGame } from "../../tests/fixtures/make-game";
import { defaultStoreState } from "../../tests/fixtures/default-store-state";
import { defaultState } from "../../tests/fixtures/default-state";
import { defaultSettings } from "../../tests/fixtures/default-settings";
import type { GameStatus } from "@shared/game/types/game-status";

vi.mock("../../services/game.service", () => ({
  gameService: {
    startGame: vi.fn(),
    flipCard: vi.fn(),
    restartGame: vi.fn(),
    resetToSettings: vi.fn(),
    startGameWithSettings: vi.fn(),
  },
}));

const won: GameStatus = "won";

beforeEach(() => {
  useGameStore.setState(defaultStoreState);
});

describe("App", () => {
  it("renders GameStart when no game exists", () => {
    render(<App />);
    expect(screen.getByText("Start Game")).toBeInTheDocument();
  });

  it("renders game board when game exists", () => {
    useGameStore.setState({ game: makeGame(), displayedSeconds: defaultState.remainingSeconds });
    render(<App />);
    expect(screen.getAllByLabelText("Hidden card")).toHaveLength(2);
  });

  it("renders GameOver when game is won", () => {
    const game = makeGame({
      settings: { ...defaultSettings, username: "Player" },
      state: { ...defaultState, status: won, remainingSeconds: 15, startTime: Date.now() },
    });
    useGameStore.setState({ game, displayedSeconds: 15 });
    render(<App />);
    expect(screen.getByText("Game Over")).toBeInTheDocument();
    expect(screen.getByText("Congratulations Player!")).toBeInTheDocument();
  });
});
