import Input, { type InputProps } from "../Input";
import { CalendarIcon } from "@heroicons/react/20/solid";
import { useRefValue } from "./useRefValue";

function DateTimeInput({ readOnly, ref, ...props }: InputProps<false>) {
  const realRef = useRefValue(ref);

  return (
    <Input
      {...props}
      ref={realRef}
      type="datetime-local"
      pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
      trailing={!readOnly ? <CalendarIcon className="w-5" /> : undefined}
      inputClassName="pr-3!"
      readOnly={readOnly}
    />
  );
}

export default DateTimeInput;
