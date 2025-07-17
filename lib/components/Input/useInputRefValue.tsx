import { type ChangeEvent, type Ref, useEffect, useRef, useState } from "react";
import { useDeepCompareEffect } from "react-use";
import { isEqual } from "lodash-es";

export default function useInputRefValue<T>({
  value,
  ref,
  name,
  onChange,
}: {
  value?: T;
  ref?: Ref<HTMLInputElement>;
  name?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
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
  }, [{ innerValue }]);

  return {
    innerRef,
    innerValue,
    setInnerValue,
  };
}
