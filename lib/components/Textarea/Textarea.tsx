import Input, { type InputProps } from "../Input";
import TextareaAutosize from "react-textarea-autosize";
import type { TextareaAutosizeProps } from "react-textarea-autosize";

export type TextareaProps = InputProps<false> &
  Partial<
    Pick<
      TextareaAutosizeProps,
      "maxRows" | "minRows" | "onHeightChange" | "cacheMeasurements"
    >
  >;

function Textarea(props: TextareaProps) {
  return <Input as={TextareaAutosize} {...props} />;
}

export default Textarea;
