import Image from 'next/image'
import localFont from 'next/font/local'
import { altFor, boxesOf, cropFor, lab, labVars, resolveFocus, sheetOf } from '@/lib/lab'
import { LabOverlay } from './lab-overlay'
import { LabOpen } from './lab-viewer'

// The sheets' typeface (SIL OFL 1.1, shipped unmodified). preload: false, or every wiki page would preload it: one
// route renders them all.
const routed = localFont({
  src: '../../public/lab/routed-gothic.ttf',
  variable: '--font-routed',
  display: 'swap',
  preload: false,
})

// MDX drops every {...} value, so all three props are plain strings.
type LabSheetProps = {
  sheet?: string
  focus?: string
  caption?: string
}

/** One detail of the lab drawing set: the sheet cropped to the parts in `focus`, lit and outlined. */
export function LabSheet({ sheet, focus, caption }: LabSheetProps) {
  const s = sheetOf(sheet)
  const ids = resolveFocus(s, focus)
  const [x, y, w, h] = cropFor(s, ids)
  const alt = altFor(s, ids)
  const place = {
    position: 'absolute',
    maxWidth: 'none',
    height: 'auto',
    width: `${(lab.w / w) * 100}%`,
    left: `${(-x / w) * 100}%`,
    top: `${(-y / h) * 100}%`,
  } as const
  const name = `${s.name.charAt(0)}${s.name.slice(1).toLowerCase()}`

  return (
    <figure className="not-prose my-8">
      <div
        className={`lab ${routed.variable} border border-[var(--lab-ink)] bg-[var(--lab-paper)] text-[var(--lab-ink)]`}
        style={labVars}
      >
        <LabOpen sheet={s.key} ids={ids} label={`Sheet ${s.n} · ${name}`}>
          <div className="relative isolate overflow-hidden" style={{ aspectRatio: `${w} / ${h}` }}>
            <Image src={`/lab/${s.light}`} alt={alt} width={lab.w} height={lab.h} className="dark:hidden" style={place} />
            <Image
              src={`/lab/${s.dark}`}
              alt={alt}
              width={lab.w}
              height={lab.h}
              className="hidden dark:block"
              style={place}
            />
            <LabOverlay view={[x, y, w, h]} lit={boxesOf(s.key, ids)} />
          </div>
        </LabOpen>
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{caption}</figcaption>
      )}
    </figure>
  )
}
