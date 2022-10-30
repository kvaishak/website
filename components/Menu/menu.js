import styles from "../Menu/menu.module.css";
import Link from "next/link";
import Theme from "../Theme/theme";

export default function Menu() {
  return (
    <div className={styles.container}>
      <Theme />
      <div className={styles["menu-items-container"]}>
        <Link href="/work">Work</Link>
        <Link href="/writings">Writings</Link>
        <div className={styles.menuButton}>
          <span>Let&apos;s chat</span>
        </div>
      </div>
    </div>
  );
}
