import {
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useId,
} from "react";
import clsx from "clsx";
import { Combobox } from "@headlessui/react";
import type Cleave from "cleave.js/react";
import type { CleaveOptions } from "cleave.js/options";

export type UnstyledInputCommonProps = {
  label?: ReactNode;
  inputClassName?: string;
  labelClassName?: string;
  helpTextClassName?: string;
  trailingClassName?: string;
  trailingInputClassName?: string;
  leadingClassName?: string;
  leadingInputClassName?: string;
  helpText?: ReactNode;
  trailing?: ReactNode;
  leading?: ReactNode;
  as?: typeof Combobox.Input | typeof Cleave;
  innerClassName?: string;
  options?: CleaveOptions;
};

export type UnstyledInputProps<Select extends boolean | undefined> =
  UnstyledInputCommonProps & {
    select?: Select;
  } & (Select extends string
      ? DetailedHTMLProps<
          InputHTMLAttributes<HTMLSelectElement>,
          HTMLSelectElement
        >
      : DetailedHTMLProps<
          InputHTMLAttributes<HTMLInputElement>,
          HTMLInputElement
        >);

function UnstyledInput<Select extends boolean | undefined>(
  {
    id,
    label,
    className,
    inputClassName,
    labelClassName,
    helpTextClassName,
    trailingClassName,
    trailingInputClassName,
    leadingClassName,
    leadingInputClassName,
    helpText,
    type = "text",
    leading,
    trailing,
    select,
    children,
    as,
    innerClassName,
    ...props
  }: UnstyledInputProps<Select>,
  ref: ForwardedRef<Select extends true ? HTMLSelectElement : HTMLInputElement>
) {
  const innerId = useId();
  id = id || innerId;

  const Component = as || (select ? "select" : "input");

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }} className={innerClassName}>
        {leading && <div className={leadingClassName}>{leading}</div>}
        <Component
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          {...(props as any)}
          className={clsx(
            inputClassName,
            leadingInputClassName && {
              [leadingInputClassName]: !!leading,
            },
            trailingInputClassName && {
              [trailingInputClassName]: !!trailing,
            }
          )}
          id={id}
          type={type}
          ref={ref}
        >
          {select ? children : undefined}
        </Component>
        {trailing && <div className={trailingClassName}>{trailing}</div>}
      </div>
      {helpText && <div className={helpTextClassName}>{helpText}</div>}
    </div>
  );
}

export default forwardRef(UnstyledInput);
