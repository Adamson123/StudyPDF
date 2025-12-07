/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // webpack: (config) => {
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     "pdfjs-dist": "pdfjs-dist/legacy/build/pdf",
  //   };
  //   return config;
  // },
  // webpack: (config) => {
  //   config.externals = [...config.externals, { canvas: "canvas" }]; // required for the canvas to work
  //   return config;
  // },
};

export default config;
