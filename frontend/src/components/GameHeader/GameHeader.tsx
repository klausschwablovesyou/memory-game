import { useGameStore } from "../../store/game-store";
import { gameService } from "../../services/game.service";
import { Logo } from "../Logo/Logo";
import styles from "./GameHeader.module.css";

export function GameHeader() {
  const displayedSeconds = useGameStore((state) => state.displayedSeconds);
  const game = useGameStore((state) => state.game);
  const setShowSettings = useGameStore((state) => state.setShowSettings);

  if (!game) return null;

  const { matchedPairs, badGuesses } = game.state;

  return (
    <header className={styles.header}>
      <Logo />

      <div className={styles.center}>
        <span className={styles.timer}>{displayedSeconds}</span>
        <div className={styles.dividerVertical} />
        <div className={styles.stats}>
          <span className={styles.statItem}>{matchedPairs} matches</span>
          <span className={styles.statItem}>{badGuesses} mistakes</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.iconButton}
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
        >
          <i className="fa-solid fa-gear" />
        </button>
        <div className={styles.dividerVertical} />
        <button
          className={styles.iconButton}
          onClick={() => gameService.restartGame()}
          aria-label="Restart"
        >
          <i className="fa-solid fa-repeat" />
        </button>
      </div>
    </header>
  );
}
