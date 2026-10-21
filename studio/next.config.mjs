/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  assetPrefix: "./",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false
};
export default nextConfig;
