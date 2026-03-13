/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'github.githubassets.com',
      },
      {
        protocol: 'https',
        hostname: 'www.adobe.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org'
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    }
    return config
  },
}

export default nextConfig

