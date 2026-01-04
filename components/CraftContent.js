import ReactMarkdown from "react-markdown";
import Link from "next/link";
import styles from "./CraftContent.module.css";

export default function CraftContent({ content, darkMode }) {
  return (
    <div className={`${styles.craftContent} ${darkMode ? "dark-mode" : ""}`}>
      <ReactMarkdown
        components={{
          a: ({ node, href, children, ...props }) => {
            const isExternal = href?.startsWith("http");
            if (isExternal) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                >
                  {children}
                </a>
              );
            }
            return <Link href={href || "#"}>{children}</Link>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
