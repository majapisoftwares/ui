import { StringValue } from "ms";
export default function waitFor<T>(asyncFunction: () => Promise<T>, interval: number | StringValue, timeout: number | StringValue): Promise<T>;
