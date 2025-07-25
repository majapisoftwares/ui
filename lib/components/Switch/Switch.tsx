import { Switch as RSwitch } from "radix-ui";
import clsx from "../../utils/clsx";
import type { ReactNode } from "react";
import Input, { type UnstyledInputCommonProps } from "../Input";

export interface SwitchProps {
  srLabel?: string;
  checked?: boolean;
  className?: string;
  rightLabel?: ReactNode;
  switchClassName?: string;
  pointerClassName?: string;
  readOnly?: boolean;
  disabled?: boolean;

  onChange?(checked: boolean): void;
}

export default function Switch({
  srLabel,
  checked,
  onChange,
  className,
  rightLabel,
  readOnly,
  switchClassName,
  pointerClassName,
  disabled,
}: SwitchProps) {
  return (
    <div className={clsx(className, "flex items-center")}>
      <RSwitch.Root
        checked={checked}
        onCheckedChange={onChange}
        className={clsx(
          {
            "bg-primary-600": checked,
            "bg-zinc-300 dark:bg-zinc-600": !checked,
            "cursor-pointer": !readOnly && !disabled,
            "cursor-not-allowed": disabled,
          },
          "focus:ring-primary-500 relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-hidden dark:ring-offset-zinc-900",
          switchClassName,
        )}
        disabled={readOnly || disabled}
      >
        {srLabel && <span className="sr-only">{srLabel}</span>}
        <RSwitch.Thumb
          aria-hidden="true"
          className={clsx(
            "pointer-events-none inline-block h-5 w-5 translate-x-0 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-5",
            pointerClassName,
          )}
        />
      </RSwitch.Root>
      {rightLabel && (
        <span className="ml-3 text-sm text-zinc-500 dark:text-zinc-300">
          {rightLabel}
        </span>
      )}
    </div>
  );
}

export type SwitchInputProps = UnstyledInputCommonProps & SwitchProps;

export function SwitchInput({
  inputClassName,
  checked,
  ...props
}: SwitchInputProps) {
  return (
    <Input
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      {...(props as any)}
      as={Switch}
      inputClassName={clsx("p-1.5 border bg-white", inputClassName)}
      checked={!!checked}
    />
  );
}
