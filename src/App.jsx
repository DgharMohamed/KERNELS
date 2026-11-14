import { useState } from 'react'
import Header from './components/Header'
import AboutPage from './pages/AboutPage'
import ComparisonPage from './pages/ComparisonPage'
import ExplorerPage from './pages/ExplorerPage'

export default function App() {
  const [view, setView] = useState('explore')
  const [comparisonId, setComparisonId] = useState(null)

  const navigate = (nextView) => {
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openComparison = (id) => {
    if (!id) return
    setComparisonId(id)
    navigate('compare')
  }

  return (
    <div className="app-shell">
      <div className="starfield" aria-hidden="true" />
      <Header activeView={view} onNavigate={navigate} />

      <div className="app-content">
        {view === 'explore' ? <ExplorerPage onCompare={openComparison} /> : null}
        {view === 'compare' ? (
          <ComparisonPage
            comparisonId={comparisonId}
            onChangeComparison={setComparisonId}
            onExplore={() => navigate('explore')}
          />
        ) : null}
        {view === 'about' ? <AboutPage onExplore={() => navigate('explore')} /> : null}
      </div>

      <footer className="app-footer">
        <span>Mars &amp; Earth Explorer · Educational MVP</span>
        <span>
          Data: IAU/USGS Gazetteer · NASA Science ·{' '}
          <a href="https://trek.nasa.gov/mars/" target="_blank" rel="noreferrer noopener">
            NASA Mars Trek
          </a>
        </span>
      </footer>
    </div>
  )
}
