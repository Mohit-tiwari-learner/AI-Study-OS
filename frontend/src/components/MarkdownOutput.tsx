import ReactMarkdown from "react-markdown";

interface Props {
  content: string;
  placeholder?: string;
  className?: string;
}

/**
 * Neumorphic inset container for AI-generated markdown output.
 * Consolidates the repeated prose + nm-inset pattern used in notes, summary, and doubt pages.
 */
export function MarkdownOutput({ content, placeholder = "Output will appear here…", className }: Props) {
  return (
    <div
      className={`nm-prose min-h-[10rem] prose prose-sm max-w-none dark:prose-invert
        prose-headings:font-display prose-headings:text-foreground
        prose-p:text-foreground/85 prose-li:text-foreground/85
        prose-strong:text-primary ${className ?? ""}`}
    >
      {content ? (
        <ReactMarkdown>{content}</ReactMarkdown>
      ) : (
        <p className="text-muted-foreground italic">{placeholder}</p>
      )}
    </div>
  );
}
