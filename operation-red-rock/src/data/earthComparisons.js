export const EARTH_SATELLITE_TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

export const EARTH_SATELLITE_ATTRIBUTION =
  'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'


export const earthComparisons = [
  {
    id: 'olympus-mauna-loa',
    marsPlaceId: 'olympus-mons',
    summary:
      'Olympus Mons and Mauna Loa are both shield volcanoes built by fluid basaltic lava, but they formed in very different tectonic settings and at vastly different scales.',
    earth: {
      name: 'Mauna Loa, Hawaii, USA',
      shortName: 'Mauna Loa',
      latitude: 19.4756,
      longitude: -155.6081,
      zoom: 9,
    },
    metrics: [
      { label: 'Feature type', mars: 'Shield volcano', earth: 'Shield volcano' },
      {
        label: 'Height',
        mars: '~22 km above the surrounding plains',
        earth: '~4.2 km above sea level (~9 km above its seafloor base)',
      },
      { label: 'Base width', mars: '~610 km', earth: '~120 km' },
      { label: 'Dominant lava', mars: 'Basaltic', earth: 'Basaltic' },
      {
        label: 'Tectonic setting',
        mars: 'Tharsis rise, no plate tectonics',
        earth: 'Hawaiian hotspot, Pacific plate',
      },
      { label: 'Activity', mars: 'Inactive', earth: 'Active (last erupted in 1984)' },
    ],
    similarities: [
      'Both are broad shield volcanoes with gently sloping flanks.',
      'Both were built by repeated eruptions of low-viscosity basaltic lava.',
      'Both have summit calderas formed when magma drained and the surface collapsed.',
      'Their shapes reflect lava spreading far from vents rather than explosive eruptions.',
    ],
    differences: [
      'Olympus Mons rises about 22 km above its surroundings; Mauna Loa rises about 4.2 km above sea level.',
      'Olympus Mons is roughly 600 km across, while Mauna Loa is about 120 km wide at its base.',
      'Mauna Loa sits on a moving tectonic plate above a hotspot; Olympus Mons grew on the stationary Tharsis rise.',
      'Mauna Loa is active, while Olympus Mons has been inactive for hundreds of millions of years.',
    ],
  },
  {
    id: 'valles-grand-canyon',
    marsPlaceId: 'valles-marineris',
    summary:
      'Both are enormous canyon landscapes, but Valles Marineris is a tectonic rift system while the Grand Canyon was carved by river erosion.',
    earth: {
      name: 'Grand Canyon, Arizona, USA',
      shortName: 'Grand Canyon',
      latitude: 36.0945,
      longitude: -112.112,
      zoom: 9,
    },
    metrics: [
      { label: 'Length', mars: '~4,000 km', earth: '~446 km' },
      { label: 'Maximum width', mars: 'Up to ~600 km', earth: 'Up to ~29 km' },
      { label: 'Maximum depth', mars: '~9 km', earth: '~1.8 km' },
      {
        label: 'Main origin',
        mars: 'Tectonic rifting, landslides and erosion',
        earth: 'River incision by the Colorado River',
      },
      {
        label: 'Dominant age',
        mars: 'Billions of years old',
        earth: 'Mainly incised over the last ~5–6 million years',
      },
      { label: 'Water today', mars: 'Dry', earth: 'Colorado River flows through it' },
    ],
    similarities: [
      'Both expose thick sequences of layered rock along steep walls.',
      'Both are hundreds of kilometers long and visible from orbit.',
      'Both have been reshaped by landslides and rockfalls.',
      'Both are dry landscapes today, so their shapes preserve evidence of past processes.',
    ],
    differences: [
      'Valles Marineris is about 4,000 km long; the Grand Canyon is about 446 km long.',
      'Valles Marineris reaches roughly 9 km deep, while the Grand Canyon is up to about 1.8 km deep.',
      'Valles Marineris formed mainly by tectonic rifting linked to the Tharsis bulge; the Grand Canyon was cut by the Colorado River.',
      'Valles Marineris is billions of years old, while the modern Grand Canyon was carved mostly in the last few million years.',
    ],
  },
  {
    id: 'jezero-mississippi-delta',
    marsPlaceId: 'jezero-crater',
    summary:
      'Both are river deltas built where sediment-laden water entered a standing body of water, but Jezero’s delta is an ancient, fossilized feature on Mars.',
    earth: {
      name: 'Mississippi River Delta, Louisiana, USA',
      shortName: 'Mississippi Delta',
      latitude: 29.15,
      longitude: -89.25,
      zoom: 8,
    },
    metrics: [
      {
        label: 'Setting',
        mars: 'Impact-crater lake',
        earth: 'Coastal delta at the Gulf of Mexico',
      },
      { label: 'Status', mars: 'Ancient and dry', earth: 'Active and building' },
      { label: 'Approximate age', mars: '~3.5 billion years', earth: 'Ongoing' },
      {
        label: 'Sediment source',
        mars: 'Inlet valleys and crater rim',
        earth: 'Mississippi River',
      },
      { label: 'Water body', mars: 'Ancient lake', earth: 'Gulf of Mexico' },
      {
        label: 'Exploration',
        mars: 'NASA’s Perseverance rover',
        earth: 'Continuous monitoring and field study',
      },
    ],
    similarities: [
      'Both formed where a river carried sediment into a standing body of water.',
      'Both preserve layered sediments that record changing flow and water levels.',
      'Fine-grained deposits in both settings can bury and preserve organic matter.',
      'Both deltas are natural archives of environmental change.',
    ],
    differences: [
      'Jezero’s delta formed in an impact-crater lake about 3.5 billion years ago; the Mississippi Delta is active today.',
      'Jezero’s delta is exposed in rock and has been dry for billions of years.',
      'The Mississippi Delta is built by one of Earth’s largest rivers and is subsiding under its own weight.',
      'Jezero is being explored by NASA’s Perseverance rover for signs of ancient microbial life.',
    ],
  },
  {
    id: 'gale-grand-canyon',
    marsPlaceId: 'gale-crater',
    summary:
      'Gale Crater’s layered mound and the Grand Canyon both expose thick stacks of sedimentary rock, but one was built up in an ancient lake and the other was cut down by a river.',
    earth: {
      name: 'Grand Canyon, Arizona, USA',
      shortName: 'Grand Canyon',
      latitude: 36.0945,
      longitude: -112.112,
      zoom: 9,
    },
    metrics: [
      {
        label: 'Feature',
        mars: '154 km impact crater with a central mound',
        earth: 'River-cut canyon, ~446 km long',
      },
      {
        label: 'Layered deposit',
        mars: 'Aeolis Mons (Mount Sharp), ~5.5 km high',
        earth: 'Canyon walls up to ~1.8 km deep',
      },
      {
        label: 'Main depositional setting',
        mars: 'Ancient lakes and wind',
        earth: 'Marine and coastal rocks later uplifted',
      },
      {
        label: 'Main erosion',
        mars: 'Wind and dry processes',
        earth: 'Colorado River incision',
      },
      {
        label: 'Age',
        mars: 'Rocks ~3.5 billion years old',
        earth: 'Rocks from ~2 billion to ~270 million years old',
      },
      {
        label: 'Explorer',
        mars: 'NASA’s Curiosity rover',
        earth: 'Field studies and tourism',
      },
    ],
    similarities: [
      'Both expose thick, well-layered stacks of sedimentary rock.',
      'Both preserve a record of changing environments over long periods.',
      'Both show evidence of water: ancient lakes at Gale and river incision at the Grand Canyon.',
      'Erosion has exposed the layers so they can be studied from orbit and on the ground.',
    ],
    differences: [
      'Gale’s layers form a mound built up inside an impact crater; the Grand Canyon’s layers are exposed in canyon walls.',
      'Gale’s sediments record ancient lakes and wind action, while the Grand Canyon records a river cutting through older rocks.',
      'Curiosity studies Gale’s layers directly; the Grand Canyon is studied through field geology.',
      'The two features differ greatly in age, size and atmospheric setting.',
    ],
  },
  {
    id: 'hellas-chicxulub',
    marsPlaceId: 'hellas-planitia',
    summary:
      'Hellas Planitia and Chicxulub are both giant impact structures, but Hellas is an ancient, open basin on Mars while Chicxulub is a buried crater on Earth linked to a mass extinction.',
    earth: {
      name: 'Chicxulub impact structure, Yucatán, Mexico',
      shortName: 'Chicxulub',
      latitude: 21.35,
      longitude: -89.55,
      zoom: 8,
    },
    metrics: [
      { label: 'Diameter', mars: '~2,300 km', earth: '~180 km' },
      { label: 'Age', mars: '~4 billion years', earth: '~66 million years' },
      {
        label: 'Preservation',
        mars: 'Open basin exposed at the surface',
        earth: 'Largely buried beneath the Yucatán platform',
      },
      {
        label: 'Floor',
        mars: 'Lowest elevations on Mars, ~7–8 km below the datum',
        earth: 'Buried, partly offshore',
      },
      {
        label: 'Associated event',
        mars: 'Ancient impact in the southern highlands',
        earth: 'End-Cretaceous mass extinction',
      },
      {
        label: 'How it is studied',
        mars: 'Orbital imagery and topography',
        earth: 'Gravity data, drilling and field work',
      },
    ],
    similarities: [
      'Both are large impact structures formed when asteroids or comets struck a planetary surface.',
      'Both show circular or basin-like morphology and shocked, fractured rocks.',
      'Both affected the geology and climate of their surroundings.',
      'Both are studied to understand impact processes across the Solar System.',
    ],
    differences: [
      'Hellas is about 2,300 km across, while Chicxulub is roughly 180 km across.',
      'Hellas formed around 4 billion years ago; Chicxulub formed about 66 million years ago.',
      'Hellas remains an open, deeply depressed basin; Chicxulub is largely buried beneath younger sediments.',
      'Chicxulub is linked to the end-Cretaceous mass extinction; no such link is known for Hellas.',
    ],
  },
]

export function getEarthComparisonById(id) {
  return earthComparisons.find((comparison) => comparison.id === id) ?? null
}
