import styles from "../Menu/menu.module.css";
import Theme from "../Theme/theme";

export default function Menu() {
  return (
    <div className={styles.container}>
      <Theme />
      <div className={styles["menu-items-container"]}>
        <span>Work</span>
        <span>Writings</span>
        <div className={styles.menuButton}>
          <span>Let&apos;s chat</span>
        </div>
      </div>
    </div>
  );
}
