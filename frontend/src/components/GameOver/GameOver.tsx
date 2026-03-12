import { useGameStore } from "../../store/game-store";
import { gameService } from "../../services/game.service";
import styles from "./GameOver.module.css";

export function GameOver() {
  const game = useGameStore((state) => state.game);
  const displayedSeconds = useGameStore((state) => state.displayedSeconds);

  if (!game || game.state.status === "playing") return null;

  const isWin = game.state.status === "won";

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>Game Over</span>
        </div>

        <div className={styles.body}>
          <p className={styles.congratulations}>
            {isWin
              ? `Congratulations ${game.settings.username}!`
              : `Better luck next time, ${game.settings.username}!`}
          </p>

          <div className={styles.stats}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Remaining time</span>
              <span className={styles.statValue}>{displayedSeconds}s</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Matches</span>
              <span className={styles.statValue}>{game.state.matchedPairs}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Mistakes</span>
              <span className={styles.statValue}>{game.state.badGuesses}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.buttonPrimary}
              onClick={() => gameService.restartGame()}
            >
              Play again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
