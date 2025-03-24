import { NextApiRequest } from "next";
import { StringValue } from "ms";
export default function rateLimiter(req: NextApiRequest, windowTime?: StringValue, requestLimit?: number): void;
