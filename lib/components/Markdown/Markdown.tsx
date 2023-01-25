import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";

export type MarkdownProps = {
  children?: string;
  className?: string;
};

export default function Markdown({ children, className }: MarkdownProps) {
  return (
    <div
      className={clsx("markdown prose max-w-none dark:prose-invert", className)}
    >
      {children && (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
      )}
    </div>
  );
}
