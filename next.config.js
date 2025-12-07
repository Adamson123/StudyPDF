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
};
export default config;