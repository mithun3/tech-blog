type AudioProps = {
  src: string
  title?: string
}

export function Audio({ src, title }: AudioProps) {
  return (
    <figure className="my-6">
      {title && (
        <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
      )}
      <audio controls src={src} className="w-full" preload="metadata">
        Your browser does not support the audio element.
      </audio>
    </figure>
  )
}
