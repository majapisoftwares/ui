import vms, { type StringValue } from "ms";

const locale: Record<string, Record<string, string>> = {
  ["en"]: {
    day: "day",
    hour: "hour",
    minute: "minute",
    second: "second",
  },
  ["pt-BR"]: {
    day: "dia",
    hour: "hora",
    minute: "minuto",
    second: "segundo",
  },
  ["undefined"]: {
    day: "day",
    hour: "hour",
    second: "second",
    minute: "minute",
  },
};

export function ms(
  value: number,
  options?: { long: boolean; locale?: string },
): string;
export function ms(value: StringValue): number;
export function ms(
  value: number | StringValue,
  options?: { long: boolean; locale?: string },
) {
  if (typeof value === "number" && options?.locale) {
    return vms(value, options)
      .replace("day", locale[String(options.locale)]!.day!)
      .replace("hour", locale[String(options.locale)]!.hour!)
      .replace("minute", locale[String(options.locale)]!.minute!)
      .replace("second", locale[String(options.locale)]!.second!);
  }
  return vms(value as StringValue);
}
