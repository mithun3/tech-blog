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
        source: '/pages/proxmox/why-i-use-proxmox',
        destination: '/pages/proxmox/basics/why-i-use-proxmox',
        permanent: true,
      },
      {
        source: '/pages/proxmox/proxmox-fundamentals',
        destination: '/pages/proxmox/basics/proxmox-fundamentals',
        permanent: true,
      },
      {
        source: '/pages/proxmox/proxmox-stack',
        destination: '/pages/proxmox/basics/proxmox-stack',
        permanent: true,
      },
      {
        source: '/pages/proxmox/storage-and-snapshots',
        destination: '/pages/proxmox/basics/storage-and-snapshots',
        permanent: true,
      },
      {
        source: '/pages/proxmox/networking-models',
        destination: '/pages/proxmox/basics/networking-models',
        permanent: true,
      },
      {
        source: '/pages/proxmox/resource-allocation',
        destination: '/pages/proxmox/basics/resource-allocation',
        permanent: true,
      },
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

