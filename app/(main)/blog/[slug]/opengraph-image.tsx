import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/posts'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Props = { params: Promise<{ slug: string }> }

export default async function Image({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  const title = post?.title ?? 'poc to prod'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '64px',
          backgroundColor: '#09090b',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Site name pill */}
        <div
          style={{
            display: 'flex',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              color: '#a1a1aa',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            poc to prod
          </div>
        </div>

        {/* Post title */}
        <div
          style={{
            fontSize: title.length > 60 ? '48px' : '64px',
            fontWeight: 700,
            color: '#fafafa',
            lineHeight: 1.1,
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* Bottom rule */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '6px',
            backgroundColor: '#3b82f6',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
