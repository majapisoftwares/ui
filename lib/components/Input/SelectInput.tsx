import { type ComponentProps, type ReactNode } from "react";
import Input, { type InputProps } from "./index";
import Select from "../Select/Select";
import clsx from "../../utils/clsx";
import useInputRefValue from "./useInputRefValue";

function SelectInput({
  options,
  onChange,
  ref,
  placeholder,
  inputClassName,
  value,
  name,
  ...props
}: InputProps<false> & {
  options: { value: string; name: ReactNode }[];
  children?: ReactNode;
  placeholder?: string;
}) {
  const { innerRef, innerValue, setInnerValue } = useInputRefValue({
    value,
    ref,
    name,
    onChange,
  });

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
          "bg-white dark:hover:bg-zinc-700/70 dark:bg-zinc-800 w-full justify-between min-h-[38px]",
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
