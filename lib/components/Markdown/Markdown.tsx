import React, { type ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import clsx from "../../utils/clsx";
import remarkGfm from "remark-gfm";

export type MarkdownProps = {
  children?: string;
  className?: string;
  options?: ComponentProps<typeof ReactMarkdown>;
};

export default function Markdown({
  children,
  className,
  options,
}: MarkdownProps) {
  return (
    <div
      className={clsx(
        "prose prose-zinc dark:prose-invert max-w-full leading-normal",
        "[&_.contains-task-list]:list-none [&_.contains-task-list]:pl-0",
        "[&_.task-list-item_input[type='checkbox']]:-mt-1",
        "prose-a:break-all",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, ...(options?.remarkPlugins || [])]}
        {...options}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
