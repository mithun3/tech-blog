import type { MDXComponents } from 'mdx/types'
import Image, { type ImageProps } from 'next/image'
import Link from 'next/link'
import { Video } from '@/components/mdx/video'
import { Audio } from '@/components/mdx/audio'
import { Callout } from '@/components/mdx/callout'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    img: (props) => (
      <Image
        sizes="(max-width: 768px) 100vw, 80vw"
        style={{ width: '100%', height: 'auto' }}
        {...(props as ImageProps)}
        alt={props.alt ?? ''}
      />
    ),
    a: ({ href = '#', children, className }) => {
      if (href.startsWith('/')) {
        return (
          <Link href={href} className={className}>
            {children}
          </Link>
        )
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {children}
        </a>
      )
    },
    Video,
    Audio,
    Callout,
    ...components,
  }
}
