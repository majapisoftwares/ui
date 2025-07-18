import clsx from "../../utils/clsx";
import {
  cloneElement,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from "react";
import Button, { type ButtonProps } from "../Button/Button";
import Tooltip from "../Tooltip";

export type TableActionButtonProps<T extends HTMLElement = HTMLButtonElement> =
  {
    title?: ReactNode;
  } & ButtonProps<T>;

export default function TableActionButton<
  T extends HTMLElement = HTMLButtonElement,
>({
  children,
  className,
  title,
  onClick,
  ...props
}: TableActionButtonProps<T>) {
  const handleClick: MouseEventHandler<T> = (e) => {
    e.stopPropagation();
    onClick?.(e);
  };

  const child = children as ReactElement<{ className?: string }>;

  const button = (
    <Button
      icon
      variant="text"
      className={clsx("p-1!", className)}
      onClick={handleClick}
      {...props}
    >
      {cloneElement(child, {
        className: clsx("h-[20px]! w-[20px]!", child.props.className),
      })}
    </Button>
  );

  if (title) {
    return <Tooltip content={title}>{button}</Tooltip>;
  }

  return button;
}
