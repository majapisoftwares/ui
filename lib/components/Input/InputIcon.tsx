import { cloneElement, type ReactElement } from "react";
import clsx from "../../utils/clsx";

export default function InputIcon({
  className,
  children,
}: {
  className?: string;
  children: ReactElement<{
    className?: string;
  }>;
}) {
  return cloneElement(children, {
    className: clsx("h-5 w-5", className),
  });
}
