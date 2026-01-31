/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jugnoo-autos-drivers.s3-ap-southeast-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
