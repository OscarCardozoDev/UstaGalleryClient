import { rybToHex } from '../utils/ryb'
import type { NamedColor } from '../utils/ryb'
import styles from './TargetColor.module.css'

interface Props {
  color: NamedColor
}

export default function TargetColor({ color }: Props) {
  const hex = rybToHex(color.r, color.y, color.b)
  return (
    <div className={styles.container}>
      <div
        className={styles.swatch}
        style={{ backgroundColor: hex }}
        role="img"
        aria-label={`Color objetivo: ${color.name}`}
      />
      <p className={styles.name}>{color.name}</p>
    </div>
  )
}
