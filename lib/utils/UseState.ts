import type { Dispatch, SetStateAction } from "react";

export type UseState<S> = [S, Dispatch<SetStateAction<S>>];
