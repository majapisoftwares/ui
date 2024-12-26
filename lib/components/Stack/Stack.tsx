import type { DetailedHTMLProps, HTMLAttributes } from "react";
import clsx from "../../utils/clsx";

export type StackProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

function Stack({ className, ...props }: StackProps) {
  return <div {...props} className={clsx("flex flex-col gap-2", className)} />;
}

export default Stack;
