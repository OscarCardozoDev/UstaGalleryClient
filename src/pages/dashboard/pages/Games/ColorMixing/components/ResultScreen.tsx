import type { Level } from '../hooks/useColorMixingGame'
import styles from './ResultScreen.module.css'

interface Props {
  score: number
  rounds: number
  level: Level
  onRestart: () => void
}

function performanceLabel(score: number, rounds: number, level: Level): string {
  if (level === 'easy') {
    const avg = rounds > 0 ? score / rounds : 0
    if (avg >= 8) return 'Excelente ojo artístico'
    if (avg >= 6) return 'Buen trabajo'
    return 'Sigue practicando'
  }
  if (level === 'medium') {
    if (rounds >= 10) return 'Velocidad impresionante'
    if (rounds >= 5) return 'Buen ritmo'
    return 'Sigue entrenando'
  }
  if (rounds >= 10) return 'Maestro del color'
  if (rounds >= 5) return 'Buen control'
  return 'Sigue practicando'
}

export default function ResultScreen({ score, rounds, level, onRestart }: Props) {
  const label = performanceLabel(score, rounds, level)

  return (
    <div className={styles.container}>
      <h2 className={styles.label}>{label}</h2>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{score.toFixed(1)}</span>
          <span className={styles.statDesc}>puntaje total</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{rounds}</span>
          <span className={styles.statDesc}>rondas completadas</span>
        </div>
        {rounds > 0 && (
          <div className={styles.stat}>
            <span className={styles.statNum}>
              {(score / rounds).toFixed(1)}
            </span>
            <span className={styles.statDesc}>promedio por ronda</span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.restartBtn} onClick={onRestart}>
          Jugar de nuevo
        </button>
      </div>
    </div>
  )
}
