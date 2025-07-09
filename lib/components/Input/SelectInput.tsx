import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import Input, { type InputProps } from "./index";
import Select from "../Select/Select";
import clsx from "../../utils/clsx";
import { useDeepCompareEffect } from "react-use";
import { isEqual } from "lodash-es";

function SelectInput({
  options,
  onChange,
  ref,
  placeholder,
  inputClassName,
  value,
  name,
  ...props
}: InputProps<undefined> & {
  options: { value: string; name: string }[];
  children?: ReactNode;
  placeholder?: string;
}) {
  const [innerValue, setInnerValue] = useState(value);

  useDeepCompareEffect(() => {
    if (value && !isEqual(value, innerValue)) {
      setInnerValue(value);
    }
  }, [{ value }]);

  const innerRef = useRef<HTMLInputElement>({
    get value() {
      return innerValue;
    },
    set value(value) {
      setInnerValue(value);
    },
  } as unknown as HTMLInputElement);

  useEffect(() => {
    if (ref) {
      if (typeof ref === "function") {
        ref(innerRef.current);
      } else {
        try {
          ref.current = innerRef.current;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // do nothing
        }
      }
    }
  }, [ref]);

  useDeepCompareEffect(() => {
    if (onChange) {
      onChange({
        target: {
          name,
          value: innerValue,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    }
  }, [innerValue]);

  return (
    <Input
      as={Select.Root}
      {...props}
      ref={innerRef}
      {...{
        value: innerValue,
        onValueChange: setInnerValue,
      }}
    >
      <Select.Trigger
        placeholder={placeholder}
        buttonClassName={clsx(
          "bg-white dark:hover:bg-zinc-700/70 dark:bg-zinc-800 w-full justify-between",
          inputClassName,
        )}
      />
      <Select.Content>
        {options?.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.name}
          </Select.Item>
        ))}
      </Select.Content>
    </Input>
  );
}

// noinspection JSUnusedGlobalSymbols
export type SelectInputProps = ComponentProps<typeof SelectInput>;

export default SelectInput;
