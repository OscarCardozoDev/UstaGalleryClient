import styles from './RoundTimer.module.css'

interface Props {
  timeLeft: number
  total?: number
}

export default function RoundTimer({ timeLeft, total = 60 }: Props) {
  const pct = (timeLeft / total) * 100
  const color = pct > 40 ? '#22c55e' : pct > 15 ? '#f59e0b' : '#ef4444'

  return (
    <div className={styles.container}>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className={styles.label} style={{ color }}>{timeLeft}s</span>
    </div>
  )
}
