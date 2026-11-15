import { formatCoordinates } from '../utils/format'
import PlaceGallery from './PlaceGallery'

function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children}
      <span aria-hidden="true"> ↗</span>
    </a>
  )
}

export default function LocationDetails({ place, onCompare }) {
  if (!place) {
    return (
      <section className="details-panel details-panel--empty" aria-label="Location details">
        <div className="details-panel__placeholder">
          <span className="details-panel__orb" aria-hidden="true" />
          <h2>Select a location</h2>
          <p>
            Choose a marker on the map or a location from the list to read its
            scientific profile.
          </p>
        </div>
      </section>
    )
  }

  const canCompare = Boolean(place.comparisonId)
  const facts = place.facts ?? []
  const sources = place.sources ?? []
  const images = place.images ?? []

  return (
    <section className="details-panel" aria-label={`${place.name} details`} aria-live="polite">
      <div className="details-panel__scroll">
        <header className="details-panel__header">
          <p className="eyebrow">{place.category}</p>
          <h2>{place.name}</h2>
          <div className="details-panel__coordinates">
            <span>{formatCoordinates(place.latitude, place.longitude)}</span>
            <span className="dot-separator" aria-hidden="true" />
            <span>{place.diameterKm.toLocaleString('en-US')} km across</span>
          </div>
        </header>

        <p className="details-panel__description">{place.description}</p>

        {images.length ? (
          <div className="gallery-block">
            <div className="gallery-block__heading">
              <h3>Image gallery</h3>
              <span className="gallery-block__count">{images.length}</span>
            </div>
            <PlaceGallery images={images} placeName={place.name} />
            <p className="gallery-block__note">
              Imagery from the NASA image archive. Open a frame for the full
              record and credit.
            </p>
          </div>
        ) : null}

        <div className="fact-block">
          <h3>Scientific highlights</h3>
          <ul className="fact-list">
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>

        <div className="earth-link">
          <p className="eyebrow">Earth analogue</p>
          <h3>{place.relatedEarth.name}</h3>
          <p>{place.relatedEarth.reason}</p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => onCompare(place.comparisonId)}
            disabled={!canCompare}
            title={canCompare ? undefined : 'A detailed comparison for this location is not part of the MVP yet.'}
          >
            {canCompare ? 'Compare with Earth' : 'Comparison not available yet'}
          </button>
        </div>

        <div className="source-block">
          <h3>Sources</h3>
          <ul className="source-list">
            {sources.map((source) => (
              <li key={source.url}>
                <ExternalLink href={source.url}>{source.label}</ExternalLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
