import Link from "next/link";
import styles from "../Footer/footer.module.css";

export default function Footer() {
  return (
    <div className={styles.footerContainer}>
      <div className={styles.footerContent}>
        <div>
          <Link href="/">
            <p>Home</p>
          </Link>

          <Link href="/work">
            <p>Work</p>
          </Link>

          <Link href="/now">
            <p>Now</p>
          </Link>
        </div>

        <div>
          <a
            className={styles.socialButton}
            href="https://www.linkedin.com/in/kvaishak/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>LinkedIn</span>
            <span className={styles.externalIcon}>↗</span>
          </a>

          <a
            className={styles.socialButton}
            href="https://github.com/kvaishak"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Github</span>
            <span className={styles.externalIcon}>↗</span>
          </a>

          <a
            className={styles.socialButton}
            href="https://twitter.com/kvaish4k"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Twitter</span>
            <span className={styles.externalIcon}>↗</span>
          </a>

          <a
            className={styles.socialButton}
            href="https://kvaishak.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Substack</span>
            <span className={styles.externalIcon}>↗</span>
          </a>

          <a
            className={styles.socialButton}
            href="https://read.cv/kvaishak"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>ReadCV</span>
            <span className={styles.externalIcon}>↗</span>
          </a>
        </div>

        <div>
          <a
            className={styles.socialButton}
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Resume</span>
            <span className={styles.externalIcon}>↗</span>
          </a>
          <Link href="/colophon">
            <p>Colophon</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
