import { HARD_MIN_SCORE } from '../hooks/useColorMixingGame'
import type { Level } from '../hooks/useColorMixingGame'
import styles from './ScoreDisplay.module.css'

interface Props {
  round: number
  score: number
  level: Level
  timeLeft?: number
}

export default function ScoreDisplay({ round, score, level, timeLeft }: Props) {
  return (
    <div className={styles.bar}>
      <div className={styles.stat}>
        <span className={styles.statLabel}>Ronda</span>
        <span className={styles.statValue}>
          {level === 'easy' ? `${round}/5` : round}
        </span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>Puntaje</span>
        <span className={styles.statValue}>{score.toFixed(1)}</span>
      </div>
      {level === 'hard' && (
        <div className={styles.stat}>
          <span className={styles.statLabel}>Mínimo</span>
          <span className={`${styles.statValue} ${styles.danger}`}>{HARD_MIN_SCORE.toFixed(1)}</span>
        </div>
      )}
      {level === 'medium' && timeLeft !== undefined && (
        <div className={styles.stat}>
          <span className={styles.statLabel}>Tiempo</span>
          <span className={`${styles.statValue} ${timeLeft <= 10 ? styles.danger : ''}`}>
            {timeLeft}s
          </span>
        </div>
      )}
    </div>
  )
}
