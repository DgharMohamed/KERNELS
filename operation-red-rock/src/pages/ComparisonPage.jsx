import ComparisonMap from '../components/ComparisonMap'
import {
  EARTH_SATELLITE_ATTRIBUTION,
  EARTH_SATELLITE_TILE_URL,
  earthComparisons,
} from '../data/earthComparisons'
import {
  MARS_ATTRIBUTION,
  MARS_MAX_ZOOM,
  MARS_TILE_URL,
  getMarsPlaceById,
} from '../data/marsPlaces'
import { formatCoordinates } from '../utils/format'
import { getFocusZoom, toMapLongitude } from '../utils/planet'

function resolveComparisons() {
  return earthComparisons
    .map((comparison) => ({
      ...comparison,
      mars: getMarsPlaceById(comparison.marsPlaceId),
    }))
    .filter((comparison) => comparison.mars)
}

function ComparisonPicker({ comparisons, onSelect, onExplore }) {
  return (
    <>
      <div className="compare-picker">
        {comparisons.map(({ id, mars, earth, summary }) => (
          <button
            key={id}
            type="button"
            className="compare-choice"
            onClick={() => onSelect(id)}
          >
            <span className="eyebrow">Mars ↔ Earth</span>
            <span className="compare-choice__pair">
              <strong>{mars.name}</strong>
              <span className="compare-choice__arrow" aria-hidden="true">
                ↔
              </span>
              <strong>{earth.shortName}</strong>
            </span>
            <span className="compare-choice__meta">{earth.name}</span>
            <span className="compare-choice__summary">{summary}</span>
            <span className="compare-choice__cta">Open comparison →</span>
          </button>
        ))}
      </div>

      <div className="content-page__actions">
        <button type="button" className="button button--primary" onClick={onExplore}>
          Explore Mars
        </button>
      </div>
    </>
  )
}

export default function ComparisonPage({ comparisonId, onChangeComparison, onExplore }) {
  const comparisons = resolveComparisons()
  const active =
    comparisons.find((comparison) => comparison.id === comparisonId) ?? null

  if (!active) {
    return (
      <main className="content-page content-page--wide">
        <div className="content-page__inner">
          <p className="eyebrow">Comparison lab · Mars ↔ Earth</p>
          <h1>Choose a planetary pairing</h1>
          <p className="content-page__lead">
            Pick a Mars location and see its closest terrestrial analogue on a
            real Earth map. Every comparison lists shared processes, important
            differences and key numbers side by side.
          </p>
          <ComparisonPicker
            comparisons={comparisons}
            onSelect={onChangeComparison}
            onExplore={onExplore}
          />
        </div>
      </main>
    )
  }

  const { mars, earth, metrics, similarities, differences, summary } = active
  const marsCenter = [mars.latitude, toMapLongitude(mars.longitude)]
  const earthCenter = [earth.latitude, earth.longitude]

  return (
    <main className="content-page content-page--wide">
      <div className="content-page__inner">
        <div className="compare-head">
          <div className="compare-head__text">
            <p className="eyebrow">Comparison lab · Mars ↔ Earth</p>
            <h1>
              {mars.name} ↔ {earth.shortName}
            </h1>
            <p className="content-page__lead">{summary}</p>
          </div>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => onChangeComparison(null)}
          >
            All comparisons
          </button>
        </div>

        <div className="compare-switcher" role="tablist" aria-label="Available comparisons">
          {comparisons.map((comparison) => {
            const selected = comparison.id === active.id
            return (
              <button
                key={comparison.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`compare-switcher__item${selected ? ' is-active' : ''}`}
                onClick={() => onChangeComparison(comparison.id)}
              >
                {comparison.mars.name} ↔ {comparison.earth.shortName}
              </button>
            )
          })}
        </div>

        <div className="compare-maps">
          <ComparisonMap
            key={`mars-${active.id}`}
            variant="mars"
            label="Mars · NASA Mars Trek"
            center={marsCenter}
            zoom={getFocusZoom(mars.diameterKm)}
            markerName={mars.name}
            markerMeta={`${formatCoordinates(mars.latitude, mars.longitude)} · ${mars.diameterKm.toLocaleString('en-US')} km across`}
            tileUrl={MARS_TILE_URL}
            attribution={MARS_ATTRIBUTION}
            maxZoom={MARS_MAX_ZOOM}
          />
          <ComparisonMap
            key={`earth-${active.id}`}
            variant="earth"
            label="Earth · Satellite"
            center={earthCenter}
            zoom={earth.zoom}
            markerName={earth.name}
            markerMeta={formatCoordinates(earth.latitude, earth.longitude)}
            tileUrl={EARTH_SATELLITE_TILE_URL}
            attribution={EARTH_SATELLITE_ATTRIBUTION}
            minZoom={1}
            maxZoom={19}
          />
        </div>

        <section className="compare-panel" aria-labelledby="compare-metrics-title">
          <h2 id="compare-metrics-title">At a glance</h2>
          <div className="compare-table-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">Metric</th>
                  <th scope="col">Mars · {mars.name}</th>
                  <th scope="col">Earth · {earth.name}</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.label}>
                    <th scope="row">{metric.label}</th>
                    <td>{metric.mars}</td>
                    <td>{metric.earth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="compare-notes">
          <section className="compare-card compare-card--shared">
            <h2>Shared processes</h2>
            <ul className="compare-list">
              {similarities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="compare-card compare-card--different">
            <h2>Important differences</h2>
            <ul className="compare-list">
              {differences.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="content-page__actions">
          <button type="button" className="button button--primary" onClick={onExplore}>
            Explore Mars
          </button>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => onChangeComparison(null)}
          >
            Compare another pair
          </button>
        </div>
      </div>
    </main>
  )
}
