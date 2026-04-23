import { useColorMixingGame } from './hooks/useColorMixingGame'
import LevelSelector from './components/LevelSelector'
import TargetColor from './components/TargetColor'
import ColorMixer from './components/ColorMixer'
import ScoreDisplay from './components/ScoreDisplay'
import RoundTimer from './components/RoundTimer'
import ResultScreen from './components/ResultScreen'
import styles from './ColorMixingGame.module.css'

export default function ColorMixingGame() {
  const { state, actions } = useColorMixingGame()
  const { phase, level, round, completedRounds, score, lastRoundScore, timeLeft, targetColor, mix } = state

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mezcla de colores</h1>
        {phase !== 'selecting-level' && level && (
          <ScoreDisplay round={round} score={score} level={level} timeLeft={timeLeft} />
        )}
      </header>

      <div className={styles.content}>
        {phase === 'selecting-level' && (
          <LevelSelector onSelect={actions.selectLevel} />
        )}

        {phase === 'playing' && level && (
          <>
            {level === 'medium' && (
              <RoundTimer timeLeft={timeLeft} total={60} />
            )}
            <div className={styles.gameArea}>
              <TargetColor color={targetColor} />
              <ColorMixer
                mix={mix}
                onChange={actions.setMix}
                onConfirm={actions.confirmMix}
              />
            </div>
          </>
        )}

        {phase === 'round-end' && (
          <div className={styles.roundEnd}>
            <p className={styles.roundScore}>
              Puntaje esta ronda: <strong>{lastRoundScore.toFixed(1)}</strong>
            </p>
            <button className={styles.nextBtn} onClick={actions.nextRound}>
              {level === 'easy' && round >= 5 ? 'Ver resultados' : 'Siguiente ronda'}
            </button>
          </div>
        )}

        {phase === 'game-over' && level && (
          <ResultScreen
            score={score}
            rounds={completedRounds}
            level={level}
            onRestart={actions.restart}
          />
        )}
      </div>
    </div>
  )
}
