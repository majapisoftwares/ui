import type { ComponentProps } from "react";
import Input, { type InputProps } from "./Input";
import { PatternFormat, type PatternFormatProps } from "react-number-format";

function PatternInput(
  props: Omit<PatternFormatProps, "customInput"> & InputProps<undefined>,
) {
  return <PatternFormat customInput={Input} {...props} />;
}

// noinspection JSUnusedGlobalSymbols
export type PatternInputProps = ComponentProps<typeof PatternInput>;

export default PatternInput;
