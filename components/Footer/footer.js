import Link from "next/link";
import styles from "../Footer/footer.module.css";

export default function Footer() {
  const leftColumn = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Work",
      href: "/work",
    },
    {
      label: "Now",
      href: "/now",
    },
    {
      label: "Colophon",
      href: "/colophon",
    },
  ];

  const centerColumn = [
    {
      label: "Twitter",
      href: "https://twitter.com/kvaishack",
    },
    {
      label: "Substack",
      href: "https://kvaishak.substack.com/",
    },
    {
      label: "Notes",
      href: "https://notes.kvaishak.com/",
    },
  ];

  const rightColumn = [
    {
      label: "Linkedin",
      href: "https://www.linkedin.com/in/kvaishak/",
    },
    {
      label: "Github",
      href: "https://github.com/kvaishak",
    },
    {
      label: "Resume",
      href: "/resume.pdf",
    },
    // {
    //   label: "ReadCV",
    //   href: "https://read.cv/vaishak",
    // },
    {
      label: "Peerlist",
      href: "https://peerlist.io/vaishak",
    },
  ];

  return (
    <div className={styles.footerContainer}>
      <div className={styles.footerContent}>
        <div>
          {leftColumn.map((entry) => (
            <Link href={entry.href} key={entry.href}>
              <p>{entry.label}</p>
            </Link>
          ))}
        </div>

        <div>
          {centerColumn.map((entry) => (
            <a
              key={entry.href}
              className={styles.socialButton}
              href={entry.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{entry.label}</span>
              <span className={styles.externalIcon}>↗</span>
            </a>
          ))}
        </div>

        <div>
          {rightColumn.map((entry) => (
            <a
              key={entry.href}
              className={styles.socialButton}
              href={entry.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{entry.label}</span>
              <span className={styles.externalIcon}>↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
