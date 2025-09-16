import type {NextConfig} from 'next';
import path from 'path';
import copy from 'copy-webpack-plugin';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack(config, {isServer, dev}) {
    // In order to get wasm file to work with Next.js, we need to add a few configurations.
    // The following configuration is needed to get wasm file to work with Next.js
    // See: https://github.com/vercel/next.js/issues/25852
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    config.plugins.push(
      new copy({
        patterns: [
          {
            from: path.join(
              path.dirname(require.resolve('sql.js')),
              'sql-wasm.wasm'
            ),
            to: path.join(process.cwd(), '.next/static/chunks/'),
          },
        ],
      })
    );

    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
        };
    }


    return config;
  },
};

export default nextConfig;
