import { StringValue } from "ms";
export default function repeatForever(fn: () => Promise<void>, interval?: number | StringValue, onError?: (error: Error) => void): Promise<void>;
