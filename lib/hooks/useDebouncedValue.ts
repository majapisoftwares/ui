import { useEffect, useState } from "react";
import ms, {StringValue} from "ms";

export default function useDebounce<T = unknown>(
  value: T,
  delay: StringValue | number,
) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(
      () => {
        setDebouncedValue(value);
      },
      typeof delay !== "number" ? ms(delay) : delay,
    );
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
