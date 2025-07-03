import type { ComponentProps } from "react";
import Input, { type InputProps } from "./Input";
import DropdownMenu from "../DropdownMenu";
import Button from "../Button";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { xor } from "lodash-es";

function MultiSelectInput({
  options,
  value,
  onChange,
  emptyLabel = "None",
  ref,
  ...props
}: Omit<InputProps<undefined>, "value" | "onChange"> & {
  options: { value: string; name: string }[];
  value?: string[];
  onChange?: (value: string[]) => void;
  emptyLabel?: string;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Input
          as={Button}
          {...props}
          ref={ref}
          trailing={<ChevronDownIcon />}
          inputClassName="text-left dark:hover:bg-zinc-700/70"
        >
          {value?.length
            ? options
                .map((project) =>
                  value.includes(project.value) ? project.name : null,
                )
                .filter(Boolean)
                .join(", ")
            : emptyLabel}
        </Input>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={() => onChange?.([])}>
          {emptyLabel}
        </DropdownMenu.Item>
        {options.map((options) => (
          <DropdownMenu.CheckboxItem
            key={options.name}
            checked={value?.includes(options.value)}
            onClick={() => onChange?.(xor(value, [options.value]))}
          >
            {options.name}
          </DropdownMenu.CheckboxItem>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

// noinspection JSUnusedGlobalSymbols
export type MultiSelectInputProps = ComponentProps<typeof MultiSelectInput>;

export default MultiSelectInput;
