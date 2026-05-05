import { useRef, useEffect, useCallback } from 'react'
import { rybToHex } from '../utils/ryb'
import type { RYBColor } from '../utils/ryb'
import styles from './ColorMixer.module.css'

interface Props {
  mix: RYBColor
  onChange: (r: number, y: number, b: number) => void
  onConfirm: () => void
}

const COLUMNS: { key: keyof RYBColor; color: string; label: string }[] = [
  { key: 'y', color: '#eab308', label: 'Amarillo' },
  { key: 'b', color: '#3b82f6', label: 'Azul' },
  { key: 'r', color: '#ef4444', label: 'Rojo' },
]

export default function ColorMixer({ mix, onChange, onConfirm }: Props) {
  const previewHex = rybToHex(mix.r, mix.y, mix.b)
  const dragging = useRef<keyof RYBColor | null>(null)
  const colRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const mixRef = useRef(mix)
  const onChangeRef = useRef(onChange)

  useEffect(() => { mixRef.current = mix })
  useEffect(() => { onChangeRef.current = onChange })

  const applyDrag = useCallback((key: keyof RYBColor, clientY: number) => {
    const col = colRefs.current[key]
    if (!col) return
    const rect = col.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, (1 - (clientY - rect.top) / rect.height) * 100))
    const m = mixRef.current
    onChangeRef.current(
      key === 'r' ? pct : m.r,
      key === 'y' ? pct : m.y,
      key === 'b' ? pct : m.b,
    )
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      applyDrag(dragging.current, e.clientY)
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return
      applyDrag(dragging.current, e.touches[0].clientY)
      e.preventDefault()
    }
    const onUp = () => { dragging.current = null }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchend', onUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchend', onUp)
    }
  }, [applyDrag])

  return (
    <div className={styles.container}>
      <div className={styles.mixer}>
        {COLUMNS.map(({ key, color, label }) => (
          <div
            key={key}
            ref={el => { colRefs.current[key] = el }}
            className={styles.sliderCol}
            onMouseDown={e => {
              dragging.current = key
              applyDrag(key, e.clientY)
              e.preventDefault()
            }}
            onTouchStart={e => {
              dragging.current = key
              applyDrag(key, e.touches[0].clientY)
              e.preventDefault()
            }}
            aria-label={label}
            role="slider"
            aria-valuenow={Math.round(mix[key])}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={styles.barFill}
              style={{ height: `${mix[key]}%`, background: color }}
            />
            <span className={styles.pctLabel}>
              {Math.round(mix[key])}%
            </span>
          </div>
        ))}
        <div className={styles.preview} style={{ backgroundColor: previewHex }} />
      </div>

      <button className={styles.confirmBtn} onClick={onConfirm}>
        Confirmar mezcla
      </button>
    </div>
  )
}
