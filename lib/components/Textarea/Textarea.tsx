import Input, { InputProps } from "../Input";
import TextareaAutosize from "react-textarea-autosize";
import { TextareaAutosizeProps } from "react-textarea-autosize/dist/declarations/src";

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
