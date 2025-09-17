
import type {NextConfig} from 'next';

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
       {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      '*.cluster-a6zx3cwnb5hnuwbgyxmofxpkfe.cloudworkstations.dev',
      'chiper-wallet.cluster-a6zx3cwnb5hnuwbgyxmofxpkfe.cloudworkstations.dev'
    ],
  },
  experimental: {
    asyncWebAssembly: true,
  },
  env: {
    NEXT_PUBLIC_EXPORT_ENCRYPTION_KEY: process.env.EXPORT_ENCRYPTION_KEY,
  },
   async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, x-user-id',
          },
        ],
      },
    ];
  },
   async middleware() {
    const { NextResponse } = await import('next/server');
    const { auth } = await import('@/lib/firebase-admin');

    return async (req: any) => {
      const { authorization } = req.headers;
      if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
          const decodedToken = await auth.verifyIdToken(idToken);
          const requestHeaders = new Headers(req.headers);
          requestHeaders.set('x-user-id', decodedToken.uid);
          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
        } catch (error) {
          return new NextResponse('Unauthorized', { status: 401 });
        }
      }
      return NextResponse.next();
    };
  },
};

export default nextConfig;
