import type { LogoProps } from "./logo-props";
import styles from "./Logo.module.css";

export function Logo({ size = "large" }: LogoProps) {
  return (
    <div className={`${styles.logo} ${styles[size]}`}>
      <span className={styles.logoText}>
        mem<span className={styles.logoDotRed}>●</span>
        <span className={styles.logoDotGray}>●</span>
        <br />
        missi<span className={styles.logoDotRed}>●</span>n
      </span>
    </div>
  );
}
