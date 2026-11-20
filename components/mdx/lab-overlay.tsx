import { groupBoxes, type Box } from '@/lib/lab'

export type Hit = { id: string; label: string; box: Box }

type Props = {
  view: Box
  lit: Box[]
  hits?: Hit[]
}

// Drawn over a sheet picture by the figure and the viewer. The highlight is the sheet's own highlighter colour; the
// dashed boundary is the cue that does not rely on colour. Hidden from assistive tech: the strip, the alt text and
// the viewer's Part list carry the same information as text.
export function LabOverlay({ view, lit, hits }: Props) {
  const viewBox = view.join(' ')
  const layer = 'pointer-events-none absolute inset-0 h-full w-full'
  return (
    <>
      <svg
        className={`${layer} [mix-blend-mode:var(--lab-blend)] [opacity:var(--lab-hlop)]`}
        viewBox={viewBox}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        style={{ fill: 'var(--lab-hl)' }}
      >
        {lit.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} />
        ))}
      </svg>
      <svg className={layer} viewBox={viewBox} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {hits?.map(({ id, label, box: [x, y, w, h] }, i) => (
          <rect
            key={`${id}-${i}`}
            data-part={id}
            x={x}
            y={y}
            width={w}
            height={h}
            fill="none"
            pointerEvents="all"
            className="cursor-pointer"
          >
            <title>{label}</title>
          </rect>
        ))}
        <g fill="none" strokeWidth={2} strokeDasharray="12 4 3 4" style={{ stroke: 'var(--lab-ink)' }}>
          {groupBoxes(lit).map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>
    </>
  )
}
