/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "res.cloudinary.com" }],
  },
  // Add environment variables that should be available to the browser
  env: {
    NEXT_PUBLIC_USE_LOCAL_SERVICES: process.env.USE_LOCAL_SERVICES,
  },
};

export default nextConfig;
