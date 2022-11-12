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

          <Link href="/writings">
            <p>Writings</p>
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
          </a>

          <a
            className={styles.socialButton}
            href="https://github.com/kvaishak"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Github</span>
          </a>

          <a
            className={styles.socialButton}
            href="https://twitter.com/kvaish4k"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Twitter</span>
          </a>

          <a
            className={styles.socialButton}
            href="https://read.cv/kvaishak"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>ReadCV</span>
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
          </a>
          <p>Misc.</p>
        </div>
      </div>
    </div>
  );
}
