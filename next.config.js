/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ["src/app", "src/components", "src/lib", "src/hooks", "src/types"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  experimental: {
    excludeDefaultMomentLocales: true,
  },
  webpack: (config, { isServer, dev }) => {
    // Fix ChunkLoadError by improving chunk loading
    if (!isServer && dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
      };
    }

    // Exclude Prisma generated files
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        "@prisma/client": "@prisma/client",
      });
    }

    // Ignore generated files
    config.module.rules.push({
      test: /\.(js|ts|tsx)$/,
      exclude: [/node_modules/, /src\/generated/, /generated/, /prisma\/generated/],
    });

    return config;
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/admin/login",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
