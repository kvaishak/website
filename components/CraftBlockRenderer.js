import React from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import styles from "./CraftContent.module.css";

// Renders inline markdown (bold, italic, links) without a wrapping <p> block
const Unwrapped = ({ children }) => <>{children}</>;

const InlineLink = ({ href, children, ...props }) => {
  const isExternal = href?.startsWith("http");
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
  return <Link href={href || "#"}>{children}</Link>;
};

function renderInline(text) {
  if (!text) return null;
  return (
    <ReactMarkdown components={{ p: Unwrapped, a: InlineLink }}>
      {text}
    </ReactMarkdown>
  );
}

/**
 * Renders an array of Craft JSON blocks preserving metadata like color,
 * textStyle, listStyle, decorations, quotes, callouts, hr lines, and rich URLs.
 */
export default function CraftBlockRenderer({ blocks, darkMode }) {
  if (!blocks?.length) return null;

  // Group consecutive list blocks (bullets / numbers)
  const groups = [];
  let currentListGroup = null;

  for (const block of blocks) {
    if (block.type === "line") {
      currentListGroup = null;
      groups.push({ type: "line", block });
      continue;
    }

    if (!block.markdown && block.type !== "richUrl") {
      currentListGroup = null;
      groups.push({ type: "blank", block });
      continue;
    }

    if (block.listStyle === "bullet" || block.listStyle === "numbered") {
      const listType = block.listStyle;
      if (!currentListGroup || currentListGroup.listType !== listType) {
        currentListGroup = { type: "list", listType, items: [] };
        groups.push(currentListGroup);
      }
      currentListGroup.items.push(block);
    } else {
      currentListGroup = null;
      groups.push({ type: "single", block });
    }
  }

  return (
    <div className={`${styles.craftContent} ${darkMode ? "dark-mode" : ""}`}>
      {groups.map((group, i) => {
        if (group.type === "line") {
          return <hr key={group.block.id || i} className={styles.hr} />;
        }

        if (group.type === "blank") {
          return <div key={group.block.id || i} className={styles.blankLine} />;
        }

        if (group.type === "list") {
          const ListTag = group.listType === "numbered" ? "ol" : "ul";
          return (
            <ListTag key={i}>
              {group.items.map((block) => {
                const content = block.markdown.replace(/^([-*]|\d+\.)\s+/, "");
                return <li key={block.id}>{renderInline(content)}</li>;
              })}
            </ListTag>
          );
        }

        const { block } = group;

        // Rich URL / Bookmark card
        if (block.type === "richUrl") {
          const match = block.markdown?.match(/^\[(.*?)\]\((.*?)\)/);
          const title = match ? match[1] : block.markdown;
          const url = match ? match[2] : block.url || "#";
          let domain = "";
          try {
            domain = new URL(url).hostname.replace(/^www\./, "");
          } catch {
            domain = url;
          }

          return (
            <a
              key={block.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.richUrlCard}
            >
              <div className={styles.richUrlBody}>
                <div className={styles.richUrlTitle}>{title}</div>
                <div className={styles.richUrlDomain}>{domain}</div>
              </div>
              <div className={styles.richUrlIcon}>↗</div>
            </a>
          );
        }

        // Callout block
        if (block.decorations?.includes("callout")) {
          const inner = block.markdown
            .replace(/<callout>([\s\S]*?)<\/callout>/, "$1")
            .trim();
          return (
            <div key={block.id} className={styles.callout}>
              <ReactMarkdown components={{ a: InlineLink }}>
                {inner}
              </ReactMarkdown>
            </div>
          );
        }

        // Quote block
        if (block.decorations?.includes("quote")) {
          const inner = block.markdown.replace(/^>\s*/, "").trim();
          return (
            <blockquote key={block.id} className={styles.quote}>
              <ReactMarkdown components={{ a: InlineLink }}>
                {inner}
              </ReactMarkdown>
            </blockquote>
          );
        }

        // Colored text block
        if (block.color) {
          return (
            <p
              key={block.id}
              style={darkMode ? undefined : { color: block.color }}
            >
              {renderInline(block.markdown)}
            </p>
          );
        }

        // Regular headings and text blocks
        return (
          <ReactMarkdown key={block.id} components={{ a: InlineLink }}>
            {block.markdown}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
