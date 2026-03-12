import type { GameCardProps } from "./game-card-props";
import styles from "./GameCard.module.css";

export function GameCard({ card, disabled, onClick }: GameCardProps) {
  const isFlipped = card.isFaceUp || card.isMatched;

  const handleClick = () => {
    if (!disabled && !isFlipped) {
      onClick(card.id);
    }
  };

  return (
    <div
      className={`${styles.card} ${isFlipped ? styles.flipped : ""} ${card.isMatched ? styles.matched : ""}`}
      onClick={handleClick}
      aria-label={isFlipped ? card.emoji : "Hidden card"}
    >
      <div className={styles.inner}>
        <div className={styles.front}>
          <div className={styles.questionMarkContainer}>
            <span className={styles.questionMark}>?</span>
          </div>
        </div>
        <div className={styles.back}>
          <div className={styles.emojiContainer}>
            <span className={styles.emoji}>{card.emoji}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
