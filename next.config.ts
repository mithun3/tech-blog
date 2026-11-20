import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

// Report-Only until it has run clean in production. A nonce-based policy would force dynamic rendering.
const cspReportOnly = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://giscus.app${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://giscus.app",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  'frame-src https://giscus.app https://www.youtube-nocookie.com https://player.vimeo.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.20.20'],
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
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
      {
        source: '/pages/proxmox/workloads/llamacpp-inference-lxc',
        destination: '/pages/proxmox/workloads/llamacpp',
        permanent: true,
      },
      {
        source: '/pages/proxmox/workloads/llamacpp-router-mode',
        destination: '/pages/proxmox/workloads/llamacpp/router-mode',
        permanent: true,
      },
      {
        source: '/pages/proxmox/workloads/llamacpp-router-mode-deployment',
        destination: '/pages/proxmox/workloads/llamacpp/router-mode-deployment',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
