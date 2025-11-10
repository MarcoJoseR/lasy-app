import path from "path";
import { fileURLToPath } from "url";

// recria __dirname em ambiente ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.next/**",
          path.resolve("C:/pagefile.sys"),
          path.resolve("C:/hiberfil.sys"),
          path.resolve("C:/swapfile.sys"),
          path.resolve("C:/DumpStack.log.tmp"),
        ],
      };
    }
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        "~": path.resolve(__dirname),
      },
    },
  },
};

export default nextConfig;
