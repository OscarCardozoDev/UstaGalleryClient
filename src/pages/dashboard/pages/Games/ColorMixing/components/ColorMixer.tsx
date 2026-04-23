import { rybToHex } from '../utils/ryb'
import type { RYBColor } from '../utils/ryb'
import styles from './ColorMixer.module.css'

interface Props {
  mix: RYBColor
  onChange: (r: number, y: number, b: number) => void
  onConfirm: () => void
}

const SLIDERS = [
  { key: 'r' as const, label: 'Rojo', color: '#ef4444' },
  { key: 'y' as const, label: 'Amarillo', color: '#eab308' },
  { key: 'b' as const, label: 'Azul', color: '#3b82f6' },
]

export default function ColorMixer({ mix, onChange, onConfirm }: Props) {
  const previewHex = rybToHex(mix.r, mix.y, mix.b)

  const handleChange = (channel: keyof RYBColor, value: number) => {
    onChange(
      channel === 'r' ? value : mix.r,
      channel === 'y' ? value : mix.y,
      channel === 'b' ? value : mix.b,
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.preview} style={{ backgroundColor: previewHex }} />
      <p className={styles.previewLabel}>Tu mezcla</p>

      <div className={styles.sliders}>
        {SLIDERS.map(({ key, label, color }) => (
          <div key={key} className={styles.sliderRow}>
            <label className={styles.sliderLabel} style={{ color }}>
              {label} <span className={styles.value}>{mix[key]}</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={mix[key]}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              className={styles.slider}
              style={{ accentColor: color }}
              aria-label={label}
            />
          </div>
        ))}
      </div>

      <button className={styles.confirmBtn} onClick={onConfirm}>
        Confirmar mezcla
      </button>
    </div>
  )
}
