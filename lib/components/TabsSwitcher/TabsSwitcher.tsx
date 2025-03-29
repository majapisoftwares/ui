import {
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  useId,
} from "react";
import clsx from "../../utils/clsx";

export default function TabsSwitcher({
  value,
  onChange,
  children,
  overflowHidden,
  className,
}: {
  value?: string;
  onChange?: (value: string) => void;
  children: ReactElement<{
    value: string;
    active?: boolean;
    onClick?: () => void;
    id?: string;
  }>[];
  overflowHidden?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <div
      className={clsx(
        "rounded-full bg-zinc-200 p-1 dark:bg-zinc-900",
        className,
      )}
    >
      <div
        className={clsx("rounded-full", {
          "overflow-hidden": overflowHidden,
        })}
      >
        <div className="relative flex">
          {Children.map(children, (child) => {
            if (isValidElement(child)) {
              const childValue = child.props.value;
              const isActive = childValue === value;
              return cloneElement(child, {
                active: isActive,
                onClick: () => onChange?.(childValue),
                id,
              });
            }
            return child;
          })}
        </div>
      </div>
    </div>
  );
}
