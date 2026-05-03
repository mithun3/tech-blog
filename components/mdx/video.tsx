type VideoProps = {
  src: string
  title?: string
  poster?: string
}

export function Video({ src, title, poster }: VideoProps) {
  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be')
  const isVimeo = src.includes('vimeo.com')

  if (isYouTube || isVimeo) {
    let embedUrl = src

    if (isYouTube) {
      const urlObj = new URL(src)
      const id = src.includes('youtu.be')
        ? urlObj.pathname.slice(1)
        : urlObj.searchParams.get('v') ?? ''
      embedUrl = `https://www.youtube-nocookie.com/embed/${id}`
    } else if (isVimeo) {
      const id = src.split('vimeo.com/')[1]?.split('?')[0] ?? ''
      embedUrl = `https://player.vimeo.com/video/${id}`
    }

    return (
      <figure className="my-6">
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <iframe
            src={embedUrl}
            title={title ?? 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
        {title && (
          <figcaption className="mt-2 text-center text-sm text-zinc-500">{title}</figcaption>
        )}
      </figure>
    )
  }

  return (
    <figure className="my-6">
      <video
        src={src}
        controls
        poster={poster}
        className="w-full rounded-lg"
        preload="metadata"
      >
        Your browser does not support the video element.
      </video>
      {title && (
        <figcaption className="mt-2 text-center text-sm text-zinc-500">{title}</figcaption>
      )}
    </figure>
  )
}
