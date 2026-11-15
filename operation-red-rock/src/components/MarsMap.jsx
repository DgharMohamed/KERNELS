import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MARS_ATTRIBUTION, MARS_INITIAL_VIEW, MARS_MAX_ZOOM, MARS_TILE_URL } from '../data/marsPlaces'
import { formatCoordinates } from '../utils/format'
import { getFocusZoom, toMapLongitude } from '../utils/planet'

function createMarkerIcon(selected) {
  return L.divIcon({
    className: `mars-marker${selected ? ' is-selected' : ''}`,
    html: '<span class="mars-marker__halo"></span><span class="mars-marker__dot"></span>',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  })
}

function ViewDetailsButton({ placeId, onViewDetails }) {
  const map = useMap()

  return (
    <button
      type="button"
      className="mars-popup__action"
      onClick={() => {
        map.closePopup()
        onViewDetails(placeId)
      }}
    >
      View details
    </button>
  )
}

function MapController({ place, resetToken, markerRefs }) {
  const map = useMap()
  const placeId = place?.id ?? null

  useEffect(() => {
    if (!place) return undefined

    map.flyTo(
      [place.latitude, toMapLongitude(place.longitude)],
      getFocusZoom(place.diameterKm),
      { duration: 1.15 },
    )

    const timeout = window.setTimeout(() => {
      markerRefs.current[place.id]?.openPopup()
    }, 950)

    return () => window.clearTimeout(timeout)
    // placeId is the intentional trigger; the place object is stable data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId, map, markerRefs])

  useEffect(() => {
    if (resetToken === 0) return
    map.closePopup()
    map.flyTo(MARS_INITIAL_VIEW.center, MARS_INITIAL_VIEW.zoom, { duration: 1 })
    // Only react when the reset button is pressed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken, map])

  return null
}

export default function MarsMap({ places, selectedId, onSelect, onViewDetails }) {
  const [resetToken, setResetToken] = useState(0)
  const markerRefs = useRef({})
  const selectedPlace = places.find((place) => place.id === selectedId) ?? null

  return (
    <div className="map-shell">
      <MapContainer
        className="mars-map"
        crs={L.CRS.EPSG4326}
        center={MARS_INITIAL_VIEW.center}
        zoom={MARS_INITIAL_VIEW.zoom}
        minZoom={0}
        maxZoom={MARS_MAX_ZOOM}
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]}
        maxBoundsViscosity={0.7}
        zoomControl={false}
        scrollWheelZoom
        worldCopyJump={false}
      >
        <TileLayer
          url={MARS_TILE_URL}
          attribution={MARS_ATTRIBUTION}
          tms={false}
          noWrap
        />
        <ZoomControl position="topright" />

        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.latitude, toMapLongitude(place.longitude)]}
            icon={createMarkerIcon(place.id === selectedId)}
            alt={place.name}
            title={place.name}
            ref={(marker) => {
              if (marker) markerRefs.current[place.id] = marker
            }}
            eventHandlers={{ click: () => onSelect(place.id) }}
          >
            <Popup>
              <div className="mars-popup">
                <p className="mars-popup__eyebrow">{place.category}</p>
                <strong>{place.name}</strong>
                <span className="mars-popup__coords">
                  {formatCoordinates(place.latitude, place.longitude)}
                </span>
                <ViewDetailsButton
                  placeId={place.id}
                  onViewDetails={onViewDetails}
                />
              </div>
            </Popup>
          </Marker>
        ))}

        <MapController
          place={selectedPlace}
          resetToken={resetToken}
          markerRefs={markerRefs}
        />
      </MapContainer>

      <div className="map-badge">
        <span className="map-badge__dot" aria-hidden="true" />
        <span>Mars · NASA Mars Trek</span>
      </div>

      <button
        type="button"
        className="map-reset"
        onClick={() => setResetToken((token) => token + 1)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M4 10a8 8 0 1 1 2.3 6.1M4 5v5h5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Reset map
      </button>

      <div className="map-readout" aria-live="polite">
        {selectedPlace ? (
          <>
            <span className="map-readout__label">{selectedPlace.name}</span>
            <span className="map-readout__value">
              {formatCoordinates(selectedPlace.latitude, selectedPlace.longitude)}
            </span>
          </>
        ) : (
          <span className="map-readout__hint">
            Drag to pan · scroll to zoom · click a marker
          </span>
        )}
      </div>
    </div>
  )
}
