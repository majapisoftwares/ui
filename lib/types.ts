import { type Dispatch, type SetStateAction, useState } from "react";

export type NoUndefinedState<T> = T extends [
  infer S | undefined,
  Dispatch<SetStateAction<infer S | undefined>>,
]
  ? [S, Dispatch<SetStateAction<S>>]
  : never;

// noinspection JSUnusedGlobalSymbols
export type UseStateTuple<T> = NoUndefinedState<ReturnType<typeof useState<T>>>;
