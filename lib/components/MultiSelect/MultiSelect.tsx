import { Combobox } from "@headlessui/react";
import Loading from "../Loading";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import Input, {
  defaultHelpTextClassName,
  defaultInputClassName,
  defaultLabelClassName,
  defaultLeadingInputClassName,
  defaultTrailingClassName,
  defaultTrailingInputClassName,
  UnstyledInput,
  UnstyledInputProps,
} from "../Input";
import clsx from "../../utils/clsx";
import { isEqual, take } from "lodash-es";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useDeepCompareEffect } from "react-use";
import { getValue, MultiSelectInput } from "./MultiSelectInput";

const defaultMenuItemsClassName =
  "z-10 rounded-md bg-white shadow-lg ring-1 ring-black/5 dark:ring-zinc-700 focus:outline-hidden dark:bg-zinc-800";

export interface MultiSelectProps<T extends object | string>
  extends Omit<
    UnstyledInputProps<false>,
    | "as"
    | "onSelect"
    | "inputClassName"
    | "innerClassName"
    | "value"
    | "onChange"
  > {
  placeholder?: string;
  emptyText?: string;
  items?: T[];
  filterProperty?: keyof T;
  filterFunction?: (item: T) => boolean;
  onChange?: (items: string[]) => void;
  renderProperty?: keyof T;
  renderFunction?: (item: T) => ReactNode;
  query?: string;
  onChangeQuery?: (query: string) => void;
  loading?: boolean;
  leadingClassName?: string;
  inputInnerClassName?: string;
  inputElementClassName?: string;
  leading?: ReactNode;
  as?: typeof Input;
  static?: boolean;
  displayValue?: (item: T | null) => string;
  value?: string[];
  creatable?: boolean;
  getCreateLabel?: (query: string) => string;
  itemsRenderLimit?: number;
  valueProperty?: string;
}

export default function MultiSelect<T extends object | string>({
  placeholder,
  emptyText = "No item found.",
  items = [],
  renderProperty = "title" as keyof T,
  renderFunction,
  filterProperty = "title" as keyof T,
  filterFunction,
  onChange,
  query: defaultQuery = "",
  onChangeQuery,
  loading,
  inputInnerClassName,
  inputElementClassName,
  as,
  trailing,
  trailingClassName,
  trailingInputClassName,
  leadingInputClassName,
  static: isStatic,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  displayValue = (item) => item?.[renderProperty] || ("" as any),
  value,
  labelClassName,
  creatable,
  getCreateLabel = (query: string) => `+ create "${query}"`,
  itemsRenderLimit,
  className,
  valueProperty = "_id",
  label,
  required,
  readOnly,
  error,
  ...props
}: MultiSelectProps<T>) {
  const [query, setQuery] = useState(defaultQuery);
  const [selectedItems, setSelectedItems] = useState<string[]>(value || []);

  // noinspection DuplicatedCode
  useEffect(() => {
    if (query !== defaultQuery) {
      setQuery(defaultQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultQuery]);
  useEffect(() => {
    if (onChangeQuery && query !== defaultQuery) {
      onChangeQuery(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const filteredItems = useMemo(
    () =>
      query === ""
        ? items
        : items.filter(
            filterFunction ||
              ((item) =>
                (typeof item === "string"
                  ? item
                  : (item[filterProperty] as string)
                )
                  .toLowerCase()
                  .includes(query.toLowerCase())),
          ),
    [filterFunction, filterProperty, items, query],
  );

  trailing = loading ? (
    <Loading />
  ) : (
    trailing ||
    (!readOnly ? (
      <Combobox.Button className="pointer-events-auto -mr-1 flex items-center">
        <ChevronUpDownIcon
          className="h-5 w-5 text-zinc-400"
          aria-hidden="true"
        />
      </Combobox.Button>
    ) : undefined)
  );

  const ComponentInput = as || UnstyledInput;

  const doRender = useCallback(
    (item: T) =>
      renderFunction
        ? renderFunction(item)
        : typeof item === "string"
          ? item
          : (item[renderProperty] as string),
    [renderFunction, renderProperty],
  );

  useDeepCompareEffect(() => {
    onChange?.(selectedItems);
  }, [selectedItems || {}]);

  useDeepCompareEffect(() => {
    if (!isEqual(selectedItems, value)) {
      setSelectedItems(value || []);
    }
  }, [value || {}]);

  const removeItem = useCallback(
    (item: T) => () =>
      setSelectedItems((selectedItems) => [
        ...selectedItems.filter(
          (i) => getValue(valueProperty, i) !== getValue(valueProperty, item),
        ),
      ]),
    [valueProperty],
  );

  if (label && required) {
    label = (
      <>
        {label} <span className="text-red-500">*</span>
      </>
    );
  }

  const renderedItems = itemsRenderLimit
    ? take(filteredItems, itemsRenderLimit)
    : filteredItems;

  let inputClassName = clsx(
    defaultInputClassName,
    "bg-white dark:bg-zinc-800 pl-0",
    inputElementClassName,
    {
      "border-dashed": readOnly,
    },
  );
  let helpTextClassName = defaultHelpTextClassName;

  if (error) {
    inputClassName = clsx(
      inputClassName,
      "border-error-300 dark:border-error-500 text-error-900 dark:text-error-500 placeholder-error-300 focus:border-error-500 dark:focus:border-error-500 focus:ring-error-500",
    );
    helpTextClassName = clsx(
      helpTextClassName,
      "text-error-600 dark:text-error-500",
    );
  }

  return (
    <div className={clsx("relative", className)}>
      <Combobox
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        onChange={setSelectedItems as any}
        value={selectedItems.map((item) => getValue(valueProperty, item))}
        multiple
      >
        {({ open }) => (
          <div>
            <ComponentInput
              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
              {...(props as any)}
              as={MultiSelectInput}
              placeholder={!readOnly ? placeholder : undefined}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              trailing={trailing}
              trailingClassName={clsx(
                defaultTrailingClassName,
                trailingClassName,
              )}
              inputClassName={inputClassName}
              innerClassName={inputInnerClassName}
              trailingInputClassName={clsx(
                defaultTrailingInputClassName,
                trailingInputClassName,
              )}
              leadingInputClassName={clsx(
                defaultLeadingInputClassName,
                leadingInputClassName,
              )}
              displayValue={displayValue}
              labelClassName={clsx(defaultLabelClassName, labelClassName)}
              selectedItems={selectedItems}
              doRender={doRender}
              removeItem={removeItem}
              required={required && !selectedItems.length}
              label={label}
              readOnly={readOnly}
              valueProperty={valueProperty}
              helpTextClassName={helpTextClassName}
              items={items}
            />

            {!readOnly &&
              ((creatable && query) || filteredItems.length > 0) && (
                <Combobox.Options
                  static={isStatic}
                  className={clsx(
                    defaultMenuItemsClassName,
                    "absolute z-10 mt-1 max-h-72 w-full scroll-py-2 overflow-y-auto py-2 text-sm text-zinc-800 dark:text-zinc-200",
                  )}
                >
                  {!renderedItems.some(
                    (item) => getValue(valueProperty, item) === query,
                  ) &&
                    creatable &&
                    !!query && (
                      <Combobox.Option
                        value={query}
                        className={({ active }) =>
                          clsx("cursor-default px-4 py-2 select-none", {
                            "bg-primary-600 text-white": active,
                          })
                        }
                      >
                        {({ selected }) => (
                          <div className="flex">
                            {selected && <CheckIcon className="mr-2 w-5" />}
                            {selected ? query : getCreateLabel(query)}
                          </div>
                        )}
                      </Combobox.Option>
                    )}
                  {renderedItems.map((item) => (
                    <Combobox.Option
                      key={getValue(valueProperty, item)}
                      value={getValue(valueProperty, item)}
                      className={({ active }) =>
                        clsx("cursor-default px-4 py-2 select-none", {
                          "bg-primary-600 text-white": active,
                        })
                      }
                    >
                      {({ selected }) => (
                        <div className="flex">
                          {selected && <CheckIcon className="mr-2 w-5" />}
                          {doRender(item)}
                        </div>
                      )}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              )}

            {!readOnly &&
              !creatable &&
              open &&
              emptyText &&
              query !== "" &&
              filteredItems.length === 0 && (
                <p
                  className={clsx(
                    defaultMenuItemsClassName,
                    "absolute mt-1 w-full p-4 text-sm text-zinc-500 dark:text-zinc-400",
                  )}
                >
                  {emptyText}
                </p>
              )}
          </div>
        )}
      </Combobox>
    </div>
  );
}
