import type { ReactNode } from "react";
import type { JSONContent } from "@tiptap/core";
import { hasRenderableTiptap, parseTiptapDocument } from "@/shared/lib/rich-text";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import TiptapImage from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import {
  TextStyle,
  Color,
  BackgroundColor,
  FontFamily,
  FontSize,
  LineHeight,
} from "@tiptap/extension-text-style";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Typography from "@tiptap/extension-typography";
import Youtube from "@tiptap/extension-youtube";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";

// Mirror the backend TipTap editor so rendered output matches what authors
// composed. StarterKit (v3) already bundles bold, italic, strike, code,
// code blocks, blockquotes, headings, lists, horizontal rules, links and
// underline; TextAlign and Image cover the remaining common tags. Add the
// matching extension here when the editor enables a new node/mark.
const TIPTAP_RENDER_EXTENSIONS = [
  StarterKit,
  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["start", "end", "left", "center", "right", "justify"],
  }),
  TiptapImage,
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Highlight.configure({
    multicolor: true,
  }),
  TextStyle,
  Color,
  BackgroundColor,
  FontFamily,
  FontSize,
  LineHeight,
  Subscript,
  Superscript,
  Typography,
  Youtube.configure({
    nocookie: true,
    controls: true,
    modestBranding: true,
  }),
  Table.configure({
    renderWrapper: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
];

/**
 * Type scale for the surface the copy sits on. The structural rules (links,
 * code, tables, lists, media) are shared across all three; see `.rich-text` in
 * globals.css.
 */
type RichTextDensity = "compact" | "default" | "article";

interface RichTextProps {
  /** TipTap rich-text document (preferred), or a plain-text string fallback. */
  content: unknown;
  /** `compact` for a category blurb, `article` for a journal entry. */
  density?: RichTextDensity;
  className?: string;
}

/**
 * Renders TipTap rich-text authored in the backend editor via the TipTap
 * extensions (headings, lists, marks, alignment, images, …). Falls back to
 * splitting a plain string into paragraphs when the content isn't a TipTap
 * document.
 */
export function RichText({
  content,
  density = "default",
  className,
}: RichTextProps) {
  const rootClassName = ["rich-text", className].filter(Boolean).join(" ");
  const tiptapDocument = parseTiptapDocument(content) as JSONContent | null;

  if (tiptapDocument && hasRenderableTiptap(tiptapDocument)) {
    let rendered: ReactNode = null;
    try {
      rendered = renderToReactElement({
        content: tiptapDocument,
        extensions: TIPTAP_RENDER_EXTENSIONS,
        staticEditorOptions: { textDirection: "auto" },
      });
    } catch {
      rendered = null;
    }

    if (rendered) {
      return (
        <div className={rootClassName} data-density={density}>
          {rendered}
        </div>
      );
    }
  }

  if (typeof content === "string") {
    const paragraphs = content
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean);

    if (paragraphs.length > 0) {
      return (
        <div className={rootClassName} data-density={density}>
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      );
    }
  }

  return null;
}
