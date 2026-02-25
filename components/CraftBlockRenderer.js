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
  return (
    <ReactMarkdown components={{ p: Unwrapped, a: InlineLink }}>
      {text}
    </ReactMarkdown>
  );
}

/**
 * Renders an array of Craft JSON blocks preserving metadata like color,
 * textStyle, listStyle, and decorations that are lost in the markdown API.
 */
export default function CraftBlockRenderer({ blocks }) {
  if (!blocks?.length) return null;

  // Group consecutive bullet blocks into <ul> runs
  const groups = [];
  let currentBulletGroup = null;

  for (const block of blocks) {
    if (!block.markdown?.trim()) {
      currentBulletGroup = null;
      continue;
    }
    if (block.listStyle === "bullet") {
      if (!currentBulletGroup) {
        currentBulletGroup = { type: "bullets", items: [] };
        groups.push(currentBulletGroup);
      }
      currentBulletGroup.items.push(block);
    } else {
      currentBulletGroup = null;
      groups.push({ type: "single", block });
    }
  }

  return (
    <div className={styles.craftContent}>
      {groups.map((group, i) => {
        if (group.type === "bullets") {
          return (
            <ul key={i}>
              {group.items.map((block) => {
                const content = block.markdown.replace(/^[-*]\s+/, "");
                return <li key={block.id}>{renderInline(content)}</li>;
              })}
            </ul>
          );
        }

        const { block } = group;

        // Callout block
        if (block.decorations?.includes("callout")) {
          const inner = block.markdown
            .replace(/<callout>([\s\S]*?)<\/callout>/, "$1")
            .trim();
          return (
            <blockquote key={block.id}>
              <p>{renderInline(inner)}</p>
            </blockquote>
          );
        }

        // Coloured text — apply inline style, render content inline
        if (block.color) {
          return (
            <p key={block.id} style={{ color: block.color }}>
              {renderInline(block.markdown)}
            </p>
          );
        }

        // All other blocks (headings, paragraphs): let ReactMarkdown handle
        // the block-level markdown prefix (###, etc.) naturally
        return (
          <ReactMarkdown
            key={block.id}
            components={{ a: InlineLink }}
          >
            {block.markdown}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
