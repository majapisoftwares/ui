import { type Ref, useEffect, useRef } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

export function parseDate(value: string) {
  try {
    // noinspection SpellCheckingInspection
    return dayjs(value, "YYYY-MM-DDTHH:mm").toISOString();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return value;
  }
}

export function formatDate(value: string) {
  try {
    // noinspection SpellCheckingInspection
    return dayjs(value).format("YYYY-MM-DDTHH:mm");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return value;
  }
}

export function useRefValue(ref?: Ref<HTMLInputElement>) {
  const realRef = useRef<HTMLInputElement>(null);

  const innerRef = useRef<HTMLInputElement>({
    get value() {
      return parseDate(realRef.current?.value || "");
    },
    set value(value) {
      if (realRef.current) {
        realRef.current.value = formatDate(value);
      }
    },
  } as unknown as HTMLInputElement);

  useEffect(() => {
    if (ref) {
      if (typeof ref === "function") {
        ref(innerRef.current);
      } else {
        ref.current = innerRef.current;
      }
    }
  }, [ref]);

  return realRef;
}
