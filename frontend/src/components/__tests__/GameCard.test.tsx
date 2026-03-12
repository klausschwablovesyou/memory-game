import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameCard } from "../GameBoard/GameCard/GameCard";
import type { Card } from "@shared/game/models/card.model";

const hiddenCard: Card = { id: "c1", isFaceUp: false, isMatched: false };
const faceUpCard: Card = { id: "c2", isFaceUp: true, isMatched: false, emoji: "🐶" };
const matchedCard: Card = { id: "c3", isFaceUp: false, isMatched: true, emoji: "🐱" };

describe("GameCard", () => {
  it("renders hidden card with question mark aria-label", () => {
    render(<GameCard card={hiddenCard} disabled={false} onClick={vi.fn()} />);
    expect(screen.getByLabelText("Hidden card")).toBeInTheDocument();
  });

  it("renders face-up card with emoji aria-label", () => {
    render(<GameCard card={faceUpCard} disabled={false} onClick={vi.fn()} />);
    expect(screen.getByLabelText("🐶")).toBeInTheDocument();
  });

  it("renders matched card with emoji aria-label", () => {
    render(<GameCard card={matchedCard} disabled={false} onClick={vi.fn()} />);
    expect(screen.getByLabelText("🐱")).toBeInTheDocument();
  });

  it("calls onClick with card id when clicking hidden card", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<GameCard card={hiddenCard} disabled={false} onClick={onClick} />);

    await user.click(screen.getByLabelText("Hidden card"));

    expect(onClick).toHaveBeenCalledWith("c1");
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<GameCard card={hiddenCard} disabled={true} onClick={onClick} />);

    await user.click(screen.getByLabelText("Hidden card"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not call onClick when card is face up", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<GameCard card={faceUpCard} disabled={false} onClick={onClick} />);

    await user.click(screen.getByLabelText("🐶"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not call onClick when card is matched", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<GameCard card={matchedCard} disabled={false} onClick={onClick} />);

    await user.click(screen.getByLabelText("🐱"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("displays question mark on hidden card front", () => {
    render(<GameCard card={hiddenCard} disabled={false} onClick={vi.fn()} />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("displays emoji on face-up card", () => {
    render(<GameCard card={faceUpCard} disabled={false} onClick={vi.fn()} />);
    expect(screen.getByText("🐶")).toBeInTheDocument();
  });
});
