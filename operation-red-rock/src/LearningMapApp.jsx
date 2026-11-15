import { useState } from 'react'
import Header from '../../interactive-map/src/components/Header.jsx'
import AboutPage from '../../interactive-map/src/pages/AboutPage.jsx'
import ComparisonPage from '../../interactive-map/src/pages/ComparisonPage.jsx'
import ExplorerPage from '../../interactive-map/src/pages/ExplorerPage.jsx'

export default function LearningMapApp() {
  const [view, setView] = useState('explore')
  const [comparisonId, setComparisonId] = useState(null)

  const navigate = (nextView) => {
    setView(nextView)
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
