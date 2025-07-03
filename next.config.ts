import nextConfig from "@majapisoftwares/next/next.config.js";
import { merge } from "lodash-es";
import type { NextConfig } from "next";

const config: NextConfig = {};

export default merge({}, nextConfig, config);
