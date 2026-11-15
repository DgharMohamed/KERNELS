import { useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet'
import L from 'leaflet'

function createPlanetIcon(variant) {
  return L.divIcon({
    className: `planet-marker planet-marker--${variant}`,
    html: '<span class="planet-marker__halo"></span><span class="planet-marker__dot"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

export default function ComparisonMap({
  variant,
  label,
  center,
  zoom,
  markerName,
  markerMeta,
  tileUrl,
  attribution,
  minZoom = 0,
  maxZoom = 8,
  showMarker = true,
}) {
  const icon = useMemo(() => createPlanetIcon(variant), [variant])

  return (
    <figure className={`compare-map compare-map--${variant}`}>
      <div className="compare-map__canvas">
        <MapContainer
          className="planet-map"
          center={center}
          zoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          crs={variant === 'mars' ? L.CRS.EPSG4326 : L.CRS.EPSG3857}
          maxBounds={
            variant === 'mars'
              ? [
                  [-85, -180],
                  [85, 180],
                ]
              : undefined
          }
          scrollWheelZoom={false}
          zoomControl={false}
        >
          <TileLayer url={tileUrl} attribution={attribution} noWrap={variant === 'mars'} />
          <ZoomControl position="topright" />
          {showMarker ? (
            <Marker position={center} icon={icon} alt={markerName} title={markerName}>
              <Popup>
                <div className="planet-popup">
                  <p className="planet-popup__eyebrow">
                    {variant === 'mars' ? 'Mars' : 'Earth'}
                  </p>
                  <strong>{markerName}</strong>
                  <span className="planet-popup__meta">{markerMeta}</span>
                </div>
              </Popup>
            </Marker>
          ) : null}
        </MapContainer>

        <span className="compare-map__badge">
          <span className="compare-map__dot" aria-hidden="true" />
          {label}
        </span>
      </div>

      <figcaption className="compare-map__caption">
        <span className="compare-map__caption-label">{label}</span>
        <strong>{markerName}</strong>
        <span className="compare-map__caption-meta">{markerMeta}</span>
      </figcaption>
    </figure>
  )
}
