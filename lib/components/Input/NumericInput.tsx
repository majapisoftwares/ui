import type { ComponentProps } from "react";
import Input, { type InputProps } from "./Input";
import { NumericFormat, type NumericFormatProps } from "react-number-format";

function NumericInput({
  ref,
  ...props
}: Omit<NumericFormatProps, "customInput"> & InputProps<undefined>) {
  return <NumericFormat getInputRef={ref} customInput={Input} {...props} />;
}

// noinspection JSUnusedGlobalSymbols
export type NumericInputProps = ComponentProps<typeof NumericInput>;

export default NumericInput;
