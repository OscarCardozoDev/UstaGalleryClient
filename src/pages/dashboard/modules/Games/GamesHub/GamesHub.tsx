import { useNavigate } from 'react-router-dom'
import styles from './GamesHub.module.css'

interface GameCard {
  id: string
  title: string
  description: string
  tags: string[]
  path: string
  available: boolean
}

const GAMES: GameCard[] = [
  {
    id: 'color-mixing',
    title: 'Mezcla de colores',
    description: 'Mezcla Rojo, Amarillo y Azul para igualar el color objetivo. Tres niveles de dificultad.',
    tags: ['Color', 'RYB', 'Pintura'],
    path: '/dashboard/games/color-mixing',
    available: true,
  },
  {
    id: 'color-sort',
    title: 'Ordenar tonos',
    description: 'Arrastra los colores para ordenarlos por saturación, luminosidad o temperatura. Próximamente.',
    tags: ['Color', 'Percepción'],
    path: '/dashboard/games/color-sort',
    available: false,
  },
]

export default function GamesHub() {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Práctica</h1>
        <p className={styles.subtitle}>Ejercicios para desarrollar tu ojo artístico</p>
      </header>

      <div className={styles.grid}>
        {GAMES.map((game) => (
          <button
            key={game.id}
            className={`${styles.card} ${!game.available ? styles.cardDisabled : ''}`}
            onClick={() => game.available && navigate(game.path)}
            disabled={!game.available}
          >
            <div className={styles.cardBody}>
              <h2 className={styles.cardTitle}>{game.title}</h2>
              <p className={styles.cardDesc}>{game.description}</p>
            </div>
            <div className={styles.tags}>
              {game.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
              {!game.available && <span className={styles.tagSoon}>Próximamente</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
