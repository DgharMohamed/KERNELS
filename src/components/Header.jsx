const NAV_ITEMS = [
  { id: 'explore', label: 'Explore Mars' },
  { id: 'compare', label: 'Compare with Earth' },
  { id: 'about', label: 'About' },
]

export default function Header({ activeView, onNavigate }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <button
          type="button"
          className="brand"
          onClick={() => onNavigate('explore')}
          aria-label="Mars and Earth Explorer — home"
        >
          <span className="brand__mark" aria-hidden="true">
            <span className="brand__planet" />
            <span className="brand__moon" />
          </span>
          <span className="brand__text">
            <span className="brand__title">Mars &amp; Earth</span>
            <span className="brand__subtitle">Explorer</span>
          </span>
        </button>

        <nav className="main-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-link${activeView === item.id ? ' is-active' : ''}`}
              aria-current={activeView === item.id ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
