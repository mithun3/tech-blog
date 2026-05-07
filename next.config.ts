import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async redirects() {
    return [
      {
        source: '/pages/virtualization/proxmox',
        destination: '/pages/proxmox',
        permanent: true,
      },
      {
        source: '/pages/virtualization/proxmox/:path*',
        destination: '/pages/proxmox/:path*',
        permanent: true,
      },
    ]
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)

