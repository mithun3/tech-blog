'use client'

import Image from 'next/image'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { altFor, boxesOf, lab, partsOn, sheetOf, type Box, type Kind } from '@/lib/lab'
import { LabOverlay, type Hit } from './lab-overlay'

type Zoom = 'fit' | '1' | '2'
// A point to bring to the middle of the view after the next render, as fractions of the sheet.
type Centre = { fx: number; fy: number }

const ZOOMS: [Zoom, string][] = [
  ['fit', 'Fit'],
  ['1', '100 %'],
  ['2', '200 %'],
]
const GROUPS: [Kind, string][] = [
  ['device', 'Devices'],
  ['guest', 'Guests'],
  ['vlan', 'VLANs'],
  ['area', 'Areas'],
]
const DETAIL = '__detail'
const DRAG_PX = 4 // a mouse press that moves less is a click

const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lab-ink)]'
const swap = 'hover:bg-[var(--lab-ink)] hover:text-[var(--lab-paper)]'
const cell =
  `min-h-11 min-w-11 shrink-0 cursor-pointer border border-[var(--lab-ink)] bg-[var(--lab-paper)] px-3 uppercase ` +
  `tracking-[0.06em] text-[var(--lab-ink)] aria-pressed:bg-[var(--lab-ink)] aria-pressed:text-[var(--lab-paper)] ${swap} ${ring}`

function centreOf(boxes: Box[]): Centre | null {
  if (!boxes.length) return null
  const x0 = Math.min(...boxes.map((b) => b[0]))
  const y0 = Math.min(...boxes.map((b) => b[1]))
  const x1 = Math.max(...boxes.map((b) => b[0] + b[2]))
  const y1 = Math.max(...boxes.map((b) => b[1] + b[3]))
  return { fx: (x0 + x1) / 2 / lab.w, fy: (y0 + y1) / 2 / lab.h }
}

type LabOpenProps = {
  sheet: string
  ids: string[]
  label: string
  children: ReactNode
}

/** The figure's strip and clickable picture, and the full-screen viewer it opens. */
export function LabOpen({ sheet, ids, label, children }: LabOpenProps) {
  const [open, setOpen] = useState(false)
  const [cur, setCur] = useState(sheet)
  const [lit, setLit] = useState<string[]>(ids)
  const [zoom, setZoom] = useState<Zoom>(ids.length ? '1' : 'fit')
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const page = useRef<HTMLDivElement>(null)
  const centre = useRef<Centre | null>(null)
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null)
  const dragged = useRef(false)
  const titleId = useId()

  useEffect(() => {
    const d = dialog.current
    if (open && d && !d.open) {
      d.showModal()
      scroller.current?.focus({ preventScroll: true })
    }
  }, [open])

  // After a render that asked for it, bring the point to the middle of the view: a jump, never an animation.
  useEffect(() => {
    const el = scroller.current
    const box = page.current
    const c = centre.current
    if (!el || !box || !c) return
    centre.current = null
    el.scrollTo({
      left: box.offsetLeft + c.fx * box.offsetWidth - el.clientWidth / 2,
      top: box.offsetTop + c.fy * box.offsetHeight - el.clientHeight / 2,
      behavior: 'instant',
    })
  })

  function show() {
    setCur(sheet)
    setLit(ids)
    setZoom(ids.length ? '1' : 'fit')
    centre.current = centreOf(boxesOf(sheet, ids))
    setOpen(true)
  }

  function closed() {
    setOpen(false)
    opener.current?.focus()
  }

  function showSheet(key: string) {
    const keep = lit.length === 1 && lab.parts[lit[0]].on[key] ? lit : []
    setCur(key)
    setLit(keep)
    centre.current = centreOf(boxesOf(key, keep)) ?? { fx: 0, fy: 0 }
  }

  function zoomTo(z: Zoom) {
    const el = scroller.current
    const box = page.current
    if (el && box) {
      centre.current = {
        fx: (el.scrollLeft + el.clientWidth / 2 - box.offsetLeft) / box.offsetWidth,
        fy: (el.scrollTop + el.clientHeight / 2 - box.offsetTop) / box.offsetHeight,
      }
    }
    setZoom(z)
  }

  function choose(e: ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    const next = v === '' ? [] : v === DETAIL ? ids : [v]
    setLit(next)
    centre.current = centreOf(boxesOf(cur, next))
  }

  function pick(e: MouseEvent<HTMLDivElement>) {
    if (dragged.current) {
      dragged.current = false
      return
    }
    const id = (e.target as Element).closest('[data-part]')?.getAttribute('data-part')
    if (id) setLit([id])
  }

  // Mouse only: drag to pan. Touch and trackpads scroll natively.
  function down(e: PointerEvent<HTMLDivElement>) {
    const el = scroller.current
    dragged.current = false
    if (e.pointerType !== 'mouse' || e.button !== 0 || !el) return
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: false }
  }

  function move(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current
    const el = scroller.current
    if (!d || !el) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.moved) {
      if (Math.hypot(dx, dy) < DRAG_PX) return
      d.moved = true
      el.setPointerCapture(e.pointerId)
    }
    el.scrollLeft = d.left - dx
    el.scrollTop = d.top - dy
  }

  function up() {
    dragged.current = drag.current?.moved ?? false
    drag.current = null
  }

  const home = sheetOf(sheet)
  const s = sheetOf(cur)
  const parts = partsOn(cur)
  const hits: Hit[] = parts
    .flatMap(([id, p]) => p.on[cur].map((box) => ({ id, label: p.label + (p.planned ? ' · PLANNED' : ''), box })))
    .sort((a, b) => b.box[2] * b.box[3] - a.box[2] * a.box[3])
  const single = lit.length === 1 ? lab.parts[lit[0]] : null
  const also = single ? lab.sheets.filter((t) => t.key !== cur && single.on[t.key]) : []
  const value = lit.length === 0 ? '' : lit.length > 1 ? DETAIL : lit[0]
  const width = zoom === 'fit' ? `min(100cqw, calc(100cqh * ${lab.w} / ${lab.h}))` : `${lab.w * Number(zoom)}px`

  return (
    <>
      <div className="flex flex-wrap items-stretch justify-between border-b border-[var(--lab-ink)] text-[0.8125rem] uppercase tracking-[0.06em]">
        <span className="flex min-h-11 items-center px-3">{label}</span>
        <button
          ref={opener}
          type="button"
          onClick={show}
          className={`ml-auto min-h-11 min-w-11 cursor-pointer border-l border-[var(--lab-ink)] px-3.5 uppercase tracking-[0.06em] ${swap} ${ring}`}
        >
          Open sheet<span className="sr-only">{` ${home.n}, ${home.key}`}</span>
        </button>
      </div>
      <div onClick={show} className="cursor-zoom-in">
        {children}
      </div>
      <dialog
        ref={dialog}
        onClose={closed}
        aria-labelledby={titleId}
        className="lab-viewer fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-[var(--lab-paper)] p-0 text-[var(--lab-ink)]"
      >
        {open && (
          // With large text the controls can fill a phone: then this column scrolls and the sheet keeps 40 % of it.
          <div className="flex h-full flex-col overflow-y-auto">
            <div className="flex flex-col gap-2 border-b border-[var(--lab-ink)] p-2 text-[0.8125rem] uppercase tracking-[0.06em]">
              <div className="flex items-center justify-between gap-2">
                <h2 id={titleId} className="px-1 text-[0.8125rem] font-normal">
                  Homelab drawing set · REV {lab.rev}
                </h2>
                <button type="button" className={cell} onClick={() => dialog.current?.close()}>
                  Close
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <div role="group" aria-label="Sheet" className="flex flex-wrap gap-2">
                  {lab.sheets.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className={cell}
                      aria-pressed={t.key === cur}
                      onClick={() => showSheet(t.key)}
                    >
                      {t.n} {t.name}
                    </button>
                  ))}
                </div>
                <div role="group" aria-label="Zoom" className="flex flex-wrap gap-2">
                  {ZOOMS.map(([z, text]) => (
                    <button key={z} type="button" className={cell} aria-pressed={z === zoom} onClick={() => zoomTo(z)}>
                      {text}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex min-w-0 items-center gap-2 px-1">
                  Part
                  <select
                    value={value}
                    onChange={choose}
                    className={`min-h-11 min-w-0 max-w-[22rem] cursor-pointer border border-[var(--lab-ink)] bg-[var(--lab-paper)] px-2 text-base text-[var(--lab-ink)] ${ring}`}
                  >
                    <option value="">No part lit</option>
                    {cur === sheet && ids.length > 1 && (
                      <option value={DETAIL}>{`This detail (${ids.length} parts)`}</option>
                    )}
                    {GROUPS.map(([kind, name]) => {
                      const group = parts.filter(([, p]) => p.kind === kind)
                      return group.length ? (
                        <optgroup key={kind} label={name}>
                          {group.map(([id, p]) => (
                            <option key={id} value={id}>
                              {p.label + (p.planned ? ' · PLANNED' : '')}
                            </option>
                          ))}
                        </optgroup>
                      ) : null
                    })}
                  </select>
                </label>
                {also.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-1">Also on</span>
                    {also.map((t) => (
                      <button key={t.key} type="button" className={cell} onClick={() => showSheet(t.key)}>
                        Sheet {t.n} {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div
              ref={scroller}
              tabIndex={0}
              role="region"
              aria-label={`Sheet ${s.n}, ${s.key}. Scroll to read.`}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onClick={pick}
              className={`relative min-h-[40dvh] flex-1 cursor-grab select-none overflow-auto overscroll-contain [container-type:size] active:cursor-grabbing ${ring} focus-visible:outline-offset-[-4px]`}
            >
              <div ref={page} className="relative isolate mx-auto" style={{ width, aspectRatio: `${lab.w} / ${lab.h}` }}>
                <Image
                  src={`/lab/${s.light}`}
                  alt={altFor(s, [])}
                  width={lab.w}
                  height={lab.h}
                  draggable={false}
                  className="block h-auto w-full dark:hidden"
                />
                <Image
                  src={`/lab/${s.dark}`}
                  alt={altFor(s, [])}
                  width={lab.w}
                  height={lab.h}
                  draggable={false}
                  className="hidden h-auto w-full dark:block"
                />
                <LabOverlay view={[0, 0, lab.w, lab.h]} lit={boxesOf(cur, lit)} hits={hits} />
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
