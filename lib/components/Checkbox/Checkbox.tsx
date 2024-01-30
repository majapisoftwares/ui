import {
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useId,
} from "react";
import { defaultTextStyles } from "../Text";
import clsx from "../../utils/clsx";

export type CheckboxProps = {
  label?: ReactNode;
  description?: ReactNode;
  labelClassName?: string;
  descriptionClassName?: string;
  inputClassName?: string;
  labelOuterClassName?: string;
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const defaultLabelClassName = defaultTextStyles.variant.label;
const defaultDescriptionClassName = defaultTextStyles.variant.secondary;

function Checkbox(
  {
    id,
    label,
    description,
    className,
    labelClassName,
    descriptionClassName,
    inputClassName,
    labelOuterClassName,
    type = "checkbox",
    ...props
  }: CheckboxProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const defaultInputId = useId();
  const descriptionId = useId();
  id = id || defaultInputId;

  labelClassName = labelClassName
    ? `${defaultLabelClassName} ${labelClassName}`
    : defaultLabelClassName;
  descriptionClassName = descriptionClassName
    ? `${defaultDescriptionClassName} ${descriptionClassName}`
    : defaultDescriptionClassName;
  inputClassName = clsx("ui-checkbox", inputClassName);

  return (
    <div className={clsx("relative flex items-start", className)}>
      <div className="flex h-5 items-center">
        <input
          {...props}
          id={id}
          aria-describedby={descriptionId}
          type={type}
          className={inputClassName}
          ref={ref}
        />
      </div>
      {(label || description) && (
        <div className={clsx("ml-3 text-sm", labelOuterClassName)}>
          {label && (
            <label htmlFor={id} className={labelClassName}>
              {label}
            </label>
          )}
          {description && (
            <p id={descriptionId} className={descriptionClassName}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default forwardRef(Checkbox);
