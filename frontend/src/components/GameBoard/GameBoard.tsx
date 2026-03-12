import { useGameStore } from "../../store/game-store";
import { gameService } from "../../services/game.service";
import { GameCard } from "./GameCard/GameCard";
import styles from "./GameBoard.module.css";

export function GameBoard() {
  const game = useGameStore((state) => state.game);
  const isFlipLocked = useGameStore((state) => state.isFlipLocked);

  if (!game) return null;

  const handleCardClick = (cardId: string) => {
    gameService.flipCard(cardId);
  };

  return (
    <div className={styles.board}>
      <div className={styles.grid}>
        {game.board.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            disabled={isFlipLocked || game.state.status !== "playing"}
            onClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  );
}
