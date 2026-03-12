import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameOver } from "../GameOver/GameOver";
import { useGameStore } from "../../store/game-store";
import { gameService } from "../../services/game.service";
import { makeGame } from "../../tests/fixtures/make-game";
import { defaultStoreState } from "../../tests/fixtures/default-store-state";
import type { GameStatus } from "@shared/game/types/game-status";

vi.mock("../../services/game.service", () => ({
  gameService: {
    restartGame: vi.fn(),
  },
}));

const playing: GameStatus = "playing";
const won: GameStatus = "won";
const lost: GameStatus = "lost";

const makeGameOverGame = (status: GameStatus) =>
  makeGame({
    settings: {
      username: "Alice",
      cardCount: 4,
      countdownSeconds: 60,
      flipBackDelayMs: 1000,
    },
    state: {
      status,
      turns: 5,
      badGuesses: 2,
      matchedPairs: 3,
      remainingSeconds: 15,
      startTime: Date.now(),
      pendingFlipBack: false,
    },
  });

beforeEach(() => {
  vi.clearAllMocks();
  useGameStore.setState({ ...defaultStoreState, displayedSeconds: 15 });
});

describe("GameOver", () => {
  it("renders nothing when no game exists", () => {
    const { container } = render(<GameOver />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when game is still playing", () => {
    useGameStore.setState({ game: makeGameOverGame(playing) });
    const { container } = render(<GameOver />);
    expect(container.firstChild).toBeNull();
  });

  it("shows congratulations message on win", () => {
    useGameStore.setState({ game: makeGameOverGame(won) });
    render(<GameOver />);
    expect(screen.getByText("Congratulations Alice!")).toBeInTheDocument();
  });

  it("shows better luck message on loss", () => {
    useGameStore.setState({ game: makeGameOverGame(lost) });
    render(<GameOver />);
    expect(screen.getByText("Better luck next time, Alice!")).toBeInTheDocument();
  });

  it("displays game stats", () => {
    useGameStore.setState({ game: makeGameOverGame(won), displayedSeconds: 15 });
    render(<GameOver />);
    expect(screen.getByText("15s")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("calls restartGame when clicking Play again", async () => {
    const user = userEvent.setup();
    useGameStore.setState({ game: makeGameOverGame(won) });
    render(<GameOver />);

    await user.click(screen.getByText("Play again"));

    expect(gameService.restartGame).toHaveBeenCalled();
  });

  it("shows Game Over header", () => {
    useGameStore.setState({ game: makeGameOverGame(lost) });
    render(<GameOver />);
    expect(screen.getByText("Game Over")).toBeInTheDocument();
  });
});
