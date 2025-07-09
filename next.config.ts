import nextConfig from "@majapisoftwares/next/next.config.js";
import { merge, omit } from "lodash-es";
import type { NextConfig } from "next";

const config: NextConfig = {};

export default merge({}, omit(nextConfig, ["webpack"]), config);
