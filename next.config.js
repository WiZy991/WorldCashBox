/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'worldcashbox.ru',
        port: '',
        pathname: '/**',
      },
    ],
    domains: ['worldcashbox.ru', 'images.unsplash.com'],
    unoptimized: false,
  },
}

module.exports = nextConfig

