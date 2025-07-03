import { motion } from "motion/react";
import type { ReactNode } from "react";
import Button from "../Button";
import clsx from "../../utils/clsx";

/**
 * Tab represents an individual tab. When active,
 * it renders an animated rounded background using the latest motion package.
 */
export default function Tab({
  active,
  onClick,
  children,
  className,
  id,
  variant,
  cursorClassName,
}: {
  value: string;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  id?: string;
  variant?: "filled" | "outlined";
  cursorClassName?: string;
}) {
  return (
    <Button
      onClick={onClick}
      className={clsx(
        "relative",
        {
          "text-white": active && variant === "filled",
        },
        className,
      )}
      variant="text"
      rounded={variant === "filled"}
    >
      {active && (
        <motion.div
          layoutId={id}
          className={clsx(
            "bg-primary-500 absolute",
            {
              "inset-0 rounded-full": variant === "filled",
              "right-0 bottom-0 left-0 h-0.5": variant === "outlined",
            },
            cursorClassName,
          )}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </Button>
  );
}
