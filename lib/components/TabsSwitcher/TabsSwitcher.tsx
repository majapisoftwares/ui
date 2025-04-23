import {
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  useId,
} from "react";
import clsx from "../../utils/clsx";

type TabElement = ReactElement<{
  value: string;
  active?: boolean;
  onClick?: () => void;
  id?: string;
  variant?: "filled" | "outlined";
  className?: string;
  cursorClassName?: string;
}>;

export default function TabsSwitcher({
  value,
  onChange,
  children,
  overflowHidden,
  className,
  variant = "filled",
  tabClassName,
  cursorClassName,
  tabsClassName,
}: {
  value?: string;
  onChange?: (value: string) => void;
  children: TabElement | TabElement[];
  overflowHidden?: boolean;
  className?: string;
  variant?: "filled" | "outlined";
  tabClassName?: string;
  cursorClassName?: string;
  tabsClassName?: string;
}) {
  const id = useId();
  return (
    <div
      className={clsx(
        {
          "rounded-full bg-zinc-200 p-1 dark:bg-zinc-900": variant === "filled",
        },
        className,
      )}
    >
      <div
        className={clsx({
          "rounded-full": variant === "filled",
          "overflow-hidden": overflowHidden,
        })}
      >
        <div className={clsx("relative flex", tabsClassName)}>
          {Children.map(children, (child) => {
            if (isValidElement(child)) {
              const childValue = child.props.value;
              const isActive = childValue === value;
              return cloneElement(child, {
                active: isActive,
                onClick: () => onChange?.(childValue),
                id,
                variant,
                className: tabClassName,
                cursorClassName,
              });
            }
            return child;
          })}
        </div>
      </div>
    </div>
  );
}
