import type { ComponentProps } from "react";
import Input, { type InputProps } from "./Input";
import DropdownMenu from "../DropdownMenu";
import Button from "../Button";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { xor } from "lodash-es";
import clsx from "../../utils/clsx";
import Badge from "../Badge";
import useInputRefValue from "./useInputRefValue";
import { useDeepCompareEffect } from "react-use";

function MultiSelectInput({
  options,
  value,
  onChange,
  emptyLabel = "None",
  ref,
  badgeClassName,
  name,
  onValueChange,
  inputClassName,
  emptyClassName,
  ...props
}: Omit<InputProps<undefined>, "value"> & {
  options: { value: string; name: string }[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  emptyLabel?: string;
  badgeClassName?: string;
  emptyClassName?: string;
}) {
  const { innerRef, innerValue, setInnerValue } = useInputRefValue({
    value,
    ref,
    name,
    onChange,
  });

  const isEmpty = !innerValue?.length;

  useDeepCompareEffect(() => {
    if (onValueChange) {
      onValueChange(innerValue || []);
    }
  }, [innerValue]);

  emptyClassName = isEmpty
    ? clsx("text-zinc-500 dark:text-zinc-500", emptyClassName)
    : "p-1.5";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Input
          as={Button}
          {...props}
          name={name}
          ref={innerRef}
          trailing={<ChevronDownIcon className="h-5 w-5 shrink-0" />}
          inputClassName={clsx(
            "text-left dark:hover:bg-zinc-700/70 bg-white gap-1.5 flex justify-start flex-wrap",
            emptyClassName,
            inputClassName,
          )}
        >
          {isEmpty
            ? emptyLabel
            : options
                .filter((option) => innerValue.includes(option.value))
                .map((option, index) => (
                  <Badge
                    key={index}
                    className={badgeClassName}
                    onActionClick={() =>
                      setInnerValue(xor(innerValue, [option.value]))
                    }
                  >
                    {option.name}
                  </Badge>
                ))}
        </Input>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={() => setInnerValue([])}>
          {emptyLabel}
        </DropdownMenu.Item>
        {options.map((option) => (
          <DropdownMenu.CheckboxItem
            key={option.name}
            checked={innerValue?.includes(option.value)}
            onClick={() => setInnerValue(xor(innerValue, [option.value]))}
          >
            {option.name}
          </DropdownMenu.CheckboxItem>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

// noinspection JSUnusedGlobalSymbols
export type MultiSelectInputProps = ComponentProps<typeof MultiSelectInput>;

export default MultiSelectInput;
