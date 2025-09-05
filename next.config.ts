
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
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.wired.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.kinja-img.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'reut.rs',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 's.abcnews.com',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'media.zenfs.com',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'images.wsj.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
