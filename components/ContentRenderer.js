import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import CraftContent from "./CraftContent";
import CraftBlockRenderer from "./CraftBlockRenderer";
import util from "../styles/util.module.css";

// NotionRenderer uses browser APIs; load it client-side only to avoid SSR issues
const NotionRenderer = dynamic(
  () => import("react-notion-x").then((m) => m.NotionRenderer),
  { ssr: false }
);

/**
 * Unified content renderer that switches between CraftContent and NotionRenderer
 * based on the provider embedded in rawData.
 *
 * Props:
 *   rawData   - { provider: 'craft' | 'notion', recordMap?, pageId?, blocks? }
 *   markdown  - string (used when provider === 'craft')
 *   darkMode  - boolean
 *   className - optional extra CSS class
 */
export default function ContentRenderer({
  rawData,
  markdown,
  darkMode,
  className,
}) {
  if (!rawData) return null;

  if (rawData.provider === "craft") {
    if (rawData.blocks) {
      return <CraftBlockRenderer blocks={rawData.blocks} darkMode={darkMode} />;
    }
    return <CraftContent content={markdown ?? ""} darkMode={darkMode} />;
  }

  if (rawData.provider === "notion" && rawData.recordMap) {
    return (
      <NotionRenderer
        recordMap={rawData.recordMap}
        fullPage={false}
        darkMode={darkMode}
        className={`${util.notionContainer}${className ? ` ${className}` : ""}`}
        components={{
          nextImage: Image,
          nextLink: Link,
        }}
        rootPageId={rawData.pageId}
      />
    );
  }

  return null;
}
