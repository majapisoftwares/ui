import clsx from "../../utils/clsx";
import Link from "next/link";
import {
  type ElementType,
  type MouseEventHandler,
  type ReactNode,
  useCallback,
} from "react";
import preventDefault from "../../utils/preventDefault";

const colorMap = {
  default: {
    badge: "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-100",
    button:
      "text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-300 dark:focus:bg-zinc-500 focus:bg-zinc-500",
  },
  primary: {
    badge:
      "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-100",
    button:
      "text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 hover:text-primary-500 dark:hover:text-primary-300 focus:bg-primary-500",
  },
  success: {
    badge:
      "bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-100",
    button:
      "text-success-400 hover:bg-success-200 dark:hover:bg-success-800 hover:text-success-500 dark:hover:text-success-300 focus:bg-success-500",
  },
  error: {
    badge: "bg-error-100 dark:bg-error-900 text-error-700 dark:text-error-100",
    button:
      "text-error-400 hover:bg-error-200 dark:hover:bg-error-800 hover:text-error-500 dark:hover:text-error-300 focus:bg-error-500",
  },
};

const sizeMap = {
  badge: {
    sm: "py-0.5 px-2 text-xs rounded-xl",
    md: "py-0.5 px-2.5 text-sm rounded-xl",
    lg: "py-0.5 px-3 text-md rounded-2xl",
  },
  button: {
    sm: "-mr-1",
    md: "-mr-1.5",
    lg: "-mr-1.5",
  },
};

function Badge({
  color = "default",
  size = "md",
  className,
  children,
  onActionClick,
  href,
  shallow,
  onClick,
  ...props
}: {
  color?: keyof typeof colorMap;
  size?: keyof (typeof sizeMap)["badge"];
  className?: string;
  children: ReactNode;
  onActionClick?: () => void;
  href?: string;
  shallow?: boolean;
  onClick?: () => void;
}) {
  const Component = href ? Link : ("span" as ElementType);

  const handleActionClick: MouseEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      onActionClick?.();
    },
    [onActionClick],
  );

  return (
    <Component
      className={clsx(
        "inline-flex items-center py-0.5 font-medium",
        sizeMap.badge[size],
        colorMap[color].badge,
        className,
      )}
      href={href}
      shallow={shallow}
      onClick={onClick}
      {...props}
    >
      {children}
      {onActionClick && (
        <div
          className={clsx(
            "ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full focus:text-white focus:outline-hidden",
            sizeMap.button[size],
            colorMap[color].button,
          )}
          onClick={handleActionClick}
          onPointerDown={preventDefault}
        >
          <span className="sr-only">Remove</span>
          <svg
            className="h-2 w-2"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 8 8"
          >
            <path
              strokeLinecap="round"
              strokeWidth="1.5"
              d="M1 1l6 6m0-6L1 7"
            />
          </svg>
        </div>
      )}
    </Component>
  );
}

export default Badge;
