import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import '../../interactive-map/src/styles/global.css'
import '../../interactive-map/src/styles/map.css'
import '../../interactive-map/src/styles/compare.css'
import './learningMap.css'
import App from '../../interactive-map/src/App.jsx'

export function mountInteractiveMap() {
  const container = document.getElementById('interactive-map-root')
  if (!container) return

  createRoot(container).render(<App />)
}
