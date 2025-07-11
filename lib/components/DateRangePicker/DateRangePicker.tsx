import React, {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  useMemo,
  useState,
} from "react";
import { type DateRange, DayPicker } from "react-day-picker";
import dayjs from "dayjs";
import { CalendarIcon } from "@heroicons/react/20/solid";
import Button from "../Button";
import clsx from "../../utils/clsx";
import { useDeepCompareEffect } from "react-use";
import Popover from "../Popover";
import {
  dayPickerButtonClassName,
  dayPickerClassNames,
} from "../../styles/DayPicker.classNames";

export type { DateRange };

export default function DateRangePicker({
  value,
  onValueChange,
  children,
  buttonProps,
  fromDate,
  toDate,
  min,
  max,
  footer,
  monthFooter,
}: {
  value?: DateRange;
  onValueChange?: (value?: DateRange) => void;
  children?: (value: string) => ReactElement;
  buttonProps?: ComponentProps<typeof Button>;
  fromDate?: Date;
  toDate?: Date;
  min?: number;
  max?: number;
  footer?: ReactNode;
  monthFooter?: ReactNode;
}) {
  const [range, setRange] = useState<DateRange | undefined>(value);

  useDeepCompareEffect(() => {
    onValueChange?.(range);
  }, [range || {}]);
  useDeepCompareEffect(() => {
    setRange(value);
  }, [value || {}]);

  const buttonText = useMemo(() => {
    let buttonText = "";
    if (range?.from) {
      if (!range.to) {
        buttonText = dayjs(range.from).format("ll");
      } else if (range.to) {
        buttonText = `${dayjs(range.from).format("ll")} – ${dayjs(
          range.to,
        ).format("ll")}`;
      }
    }
    return buttonText;
  }, [range]);

  const children2 = children ? (
    children(buttonText)
  ) : (
    <Button
      {...buttonProps}
      leading={buttonProps?.leading || <CalendarIcon />}
      className={clsx(dayPickerButtonClassName, buttonProps?.className)}
    >
      {buttonText}
    </Button>
  );

  const hidden = useMemo(
    () => [
      ...(fromDate
        ? [
            {
              before: fromDate,
            },
          ]
        : []),
      ...(toDate
        ? [
            {
              after: toDate,
            },
          ]
        : []),
    ],
    [fromDate, toDate],
  );

  return (
    <Popover.Root>
      <Popover.Trigger asChild>{children2}</Popover.Trigger>
      <Popover.Content>
        <DayPicker
          mode="range"
          defaultMonth={value?.from}
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
          showOutsideDays
          classNames={dayPickerClassNames}
          startMonth={fromDate}
          endMonth={toDate}
          hidden={hidden}
          min={min}
          max={max}
          footer={monthFooter}
          excludeDisabled
        />
        {footer}
      </Popover.Content>
    </Popover.Root>
  );
}
