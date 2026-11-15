import { formatCoordinates } from '../utils/format'

export default function LocationList({ places, selectedId, onSelect }) {
  return (
    <section className="location-list" aria-label="Mars locations">
      <div className="section-heading">
        <h2>Featured locations</h2>
        <span className="section-heading__count">{places.length}</span>
      </div>

      {places.length === 0 ? (
        <p className="empty-state">No locations match your search. Try a broader term.</p>
      ) : (
        <ul className="location-list__items">
          {places.map((place, index) => {
            const selected = place.id === selectedId
            return (
              <li key={place.id}>
                <button
                  type="button"
                  className={`location-card${selected ? ' is-selected' : ''}`}
                  onClick={() => onSelect(place.id)}
                  aria-pressed={selected}
                >
                  <span className="location-card__index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="location-card__body">
                    <span className="location-card__name">{place.name}</span>
                    <span className="location-card__meta">
                      {place.category} · {formatCoordinates(place.latitude, place.longitude)}
                    </span>
                  </span>
                  <span className="location-card__chevron" aria-hidden="true">
                    ›
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
