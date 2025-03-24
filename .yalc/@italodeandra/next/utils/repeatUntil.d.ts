import { StringValue } from "ms";
export default function repeatUntil(fn: () => Promise<boolean>, interval: number | StringValue): Promise<void>;
