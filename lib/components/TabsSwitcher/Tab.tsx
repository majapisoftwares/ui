import { motion } from "motion/react";
import { ReactNode } from "react";
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
}: {
  value: string;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <Button
      onClick={onClick}
      className={clsx(
        "relative",
        {
          "text-white": active,
        },
        className,
      )}
      variant="text"
      rounded
    >
      {active && (
        <motion.div
          layoutId={id}
          className="bg-primary-500 absolute inset-0 rounded-full"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </Button>
  );
}
