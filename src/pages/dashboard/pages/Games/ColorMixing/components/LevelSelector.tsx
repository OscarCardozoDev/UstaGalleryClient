import type { Level } from '../hooks/useColorMixingGame'
import styles from './LevelSelector.module.css'

interface Props {
  onSelect: (level: Level) => void
}

const LEVELS: { id: Level; label: string; description: string; rule: string }[] = [
  {
    id: 'easy',
    label: 'Fácil',
    description: '5 rondas fijas',
    rule: 'Consigue el mayor puntaje acumulado en 5 colores.',
  },
  {
    id: 'medium',
    label: 'Medio',
    description: '60 segundos',
    rule: 'Mezcla tantos colores como puedas antes de que se acabe el tiempo.',
  },
  {
    id: 'hard',
    label: 'Difícil',
    description: 'Sobrevive',
    rule: 'Necesitas 7.0 o más en cada ronda. Un error y termina el juego.',
  },
]

export default function LevelSelector({ onSelect }: Props) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Elige tu nivel</h2>
      <div className={styles.grid}>
        {LEVELS.map((level) => (
          <button
            key={level.id}
            className={styles.card}
            onClick={() => onSelect(level.id)}
          >
            <span className={styles.label}>{level.label}</span>
            <span className={styles.description}>{level.description}</span>
            <p className={styles.rule}>{level.rule}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
