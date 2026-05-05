import { Routes, Route, Navigate } from 'react-router-dom'
import GamesHub from './GamesHub/GamesHub'
import ColorMixingGame from './ColorMixing/ColorMixingGame'

export default function GamesRoutes() {
  return (
    <Routes>
      <Route index element={<GamesHub />} />
      <Route path="color-mixing" element={<ColorMixingGame />} />
      <Route path="*" element={<Navigate to="/dashboard/games" replace />} />
    </Routes>
  )
}
