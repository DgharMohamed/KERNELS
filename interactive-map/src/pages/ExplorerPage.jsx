import { useMemo, useState } from 'react'
import LocationDetails from '../components/LocationDetails'
import LocationList from '../components/LocationList'
import MarsMap from '../components/MarsMap'
import PlaceDetailDialog from '../components/PlaceDetailDialog'
import SearchBar from '../components/SearchBar'
import { marsPlaces } from '../data/marsPlaces'

export default function ExplorerPage({ initialSelectedId = null, onCompare }) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(initialSelectedId)
  const [detailId, setDetailId] = useState(null)

  const filteredPlaces = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return marsPlaces

    return marsPlaces.filter((place) =>
      [place.name, place.category, place.shortDescription, place.relatedEarth.name]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
  }, [query])

  const selectedPlace = marsPlaces.find((place) => place.id === selectedId) ?? null
  const detailPlace = marsPlaces.find((place) => place.id === detailId) ?? null

  const openDetails = (id) => {
    setSelectedId(id)
    setDetailId(id)
  }

  return (
    <main className="explorer-layout">
      <section className="map-column" aria-label="Interactive Mars map">
        <div className="page-intro">
          <p className="eyebrow">Planetary atlas · Mars</p>
          <h1>The Red Planet, up close</h1>
          <p>
            Explore a real Mars basemap, open the five featured locations and
            read what planetary scientists have learned about them.
          </p>
        </div>
        <MarsMap
          places={marsPlaces}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onViewDetails={openDetails}
        />
      </section>

      <aside className="explorer-sidebar" aria-label="Mars location explorer">
        <SearchBar
          value={query}
          onChange={setQuery}
          resultCount={filteredPlaces.length}
          totalCount={marsPlaces.length}
        />
        <LocationList places={filteredPlaces} selectedId={selectedId} onSelect={setSelectedId} />
        <LocationDetails place={selectedPlace} onCompare={onCompare} />
      </aside>

      <PlaceDetailDialog
        place={detailPlace}
        onClose={() => setDetailId(null)}
        onCompare={onCompare}
      />
    </main>
  )
}
