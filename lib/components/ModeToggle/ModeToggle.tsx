import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import Button from "../Button";
import clsx from "../../utils/clsx";
import useModeToggle from "./useModeToggle";
import { Ref } from "react";

export interface ModeToggleProps {
  ariaLabel?: string;
  className?: string;
  iconClassName?: string;
  ref?: Ref<HTMLButtonElement>;
}

const ModeToggle = function ModeToggle({
  ariaLabel = "Toggle dark mode",
  className,
  iconClassName,
  ref,
}: ModeToggleProps) {
  const toggleMode = useModeToggle();

  return (
    <Button
      ref={ref}
      icon
      variant="text"
      aria-label={ariaLabel}
      onClick={toggleMode}
      className={className}
    >
      <SunIcon className={clsx("dark:hidden", iconClassName)} />
      <MoonIcon className={clsx("hidden dark:block", iconClassName)} />
    </Button>
  );
};

export default ModeToggle;
