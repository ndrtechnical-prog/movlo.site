import React from "react";
import { AdSettings } from "../types";
import { AdSlot } from "./AdSlot";

interface MarkdownRendererProps {
  markdown: string;
  adSettings?: AdSettings;
  onNavigate?: (path: string) => void;
}

function renderInline(
  text: string,
  onNavigate?: (path: string) => void
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Match markdown links [label](url), **bold**, *italic*, or `code`
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("[")) {
      const m = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        const [, label, href] = m;
        const isInternal = href.startsWith("/");
        nodes.push(
          <a
            key={keyIdx++}
            href={href}
            target={isInternal ? undefined : "_blank"}
            rel={isInternal ? undefined : "noopener noreferrer"}
            onClick={(e) => {
              if (isInternal && onNavigate) {
                e.preventDefault();
                onNavigate(href);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            {label}
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={keyIdx++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={keyIdx++}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={keyIdx++}>{token.slice(1, -1)}</code>);
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  markdown,
  adSettings,
  onNavigate
}) => {
  const blocks = markdown
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const midPoint = Math.max(2, Math.floor(blocks.length / 2));

  return (
    <div className="editorial-prose">
      {blocks.map((block, index) => {
        const showMidAd = Boolean(adSettings && index === midPoint);

        let element: React.ReactNode;
        if (block.startsWith("## ")) {
          element = <h2>{renderInline(block.slice(3).trim(), onNavigate)}</h2>;
        } else if (block.startsWith("### ")) {
          element = <h3>{renderInline(block.slice(4).trim(), onNavigate)}</h3>;
        } else if (block.startsWith("> ")) {
          const quoteText = block
            .split("\n")
            .map((l) => l.replace(/^>\s?/, ""))
            .join(" ");
          element = <blockquote>{renderInline(quoteText, onNavigate)}</blockquote>;
        } else if (block.split("\n").every((l) => /^[-*]\s+/.test(l.trim()))) {
          const items = block.split("\n").map((l) => l.trim().replace(/^[-*]\s+/, ""));
          element = (
            <ul>
              {items.map((item, i) => (
                <li key={i}>{renderInline(item, onNavigate)}</li>
              ))}
            </ul>
          );
        } else if (block.split("\n").every((l) => /^\d+\.\s+/.test(l.trim()))) {
          const items = block.split("\n").map((l) => l.trim().replace(/^\d+\.\s+/, ""));
          element = (
            <ol>
              {items.map((item, i) => (
                <li key={i}>{renderInline(item, onNavigate)}</li>
              ))}
            </ol>
          );
        } else {
          element = <p>{renderInline(block.replace(/\n+/g, " "), onNavigate)}</p>;
        }

        return (
          <React.Fragment key={index}>
            {element}
            {showMidAd && adSettings && (
              <AdSlot placement="mid_article" adSettings={adSettings} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
