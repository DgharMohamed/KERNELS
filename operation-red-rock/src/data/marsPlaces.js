export const MARS_ATTRIBUTION =
  'NASA/JPL <a href="https://trek.nasa.gov/mars/" target="_blank" rel="noreferrer">Mars Trek</a> · MGS MOLA colorized hillshade'

export const MARS_TILE_URL =
  'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg'

export const MARS_MAX_ZOOM = 7

export const MARS_INITIAL_VIEW = {
  center: [0, 0],
  zoom: 1,
}

export const marsPlaces = [
  {
    id: 'olympus-mons',
    name: 'Olympus Mons',
    category: 'Shield volcano',
    latitude: 18.65,
    longitude: 226.2,
    diameterKm: 610,
    shortDescription:
      'The largest known volcano in the Solar System, a broad shield built by countless fluid lava flows on the Tharsis rise.',
    images: [
      {
        src: 'https://images-assets.nasa.gov/image/PIA10063/PIA10063~medium.jpg',
        title: 'Olympus Mons from orbit',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA10063',
      },
      {
        src: 'https://images-assets.nasa.gov/image/PIA10871/PIA10871~medium.jpg',
        title: 'Olympus Mons and its surrounding plains',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA10871',
      },
      {
        src: 'https://images-assets.nasa.gov/image/PIA00300/PIA00300~medium.jpg',
        title: 'Olympus Mons volcano',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA00300',
      },
    ],
    description:
      'Olympus Mons is a giant shield volcano on the Tharsis volcanic province of Mars. Its gently sloping flanks were built by repeated eruptions of low-viscosity basaltic lava, producing a mountain more than 600 km across. A complex summit caldera records episodes of magma withdrawal and collapse. The volcano is not active today.',
    facts: [
      'It rises about 22 km above the surrounding plains, roughly two and a half times the height of Mount Everest.',
      'Its base spans more than 600 km, an area comparable to the state of Arizona.',
      'The summit caldera is about 25 km across and almost 3 km deep, formed by repeated collapse after eruptions.',
      'Its slopes are only a few degrees steep, so an astronaut could walk up the volcano rather than climb it.',
      'Olympus Mons is considered inactive; its youngest lava flows are still hundreds of millions of years old.',
    ],
    sources: [
      {
        label: 'IAU/USGS Gazetteer — Olympus Mons (Feature ID 4453)',
        url: 'https://planetarynames.wr.usgs.gov/Feature/4453',
      },
      {
        label: 'NASA Science — Viking 1 Orbiter Image of Olympus Mons',
        url: 'https://science.nasa.gov/resource/viking-1-orbiter-image-olympus-mons',
      },
      {
        label: 'NASA Science — Mars Facts',
        url: 'https://science.nasa.gov/mars/facts/',
      },
    ],
    relatedEarth: {
      name: 'Mauna Loa, Hawaii, USA',
      reason:
        'Both are basaltic shield volcanoes built by fluid lava flows, but Olympus Mons is far larger and grew without plate-tectonic motion.',
    },
    comparisonId: 'olympus-mauna-loa',
  },
  {
    id: 'valles-marineris',
    name: 'Valles Marineris',
    category: 'Canyon system',
    latitude: -13.74,
    longitude: 300.8,
    diameterKm: 3769,
    shortDescription:
      'A vast rift-valley system near the Martian equator, often called the Grand Canyon of Mars.',
    images: [
      {
        src: 'https://images-assets.nasa.gov/image/PIA00422/PIA00422~medium.jpg',
        title: 'Valles Marineris',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA00422',
      },
      {
        src: 'https://images-assets.nasa.gov/image/PIA06926/PIA06926~medium.jpg',
        title: 'Valles Marineris mosaic',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA06926',
      },
      {
        src: 'https://images-assets.nasa.gov/image/PIA04711/PIA04711~medium.jpg',
        title: 'Valles Marineris landforms',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA04711',
      },
      {
        src: 'https://images-assets.nasa.gov/image/PIA09391/PIA09391~medium.jpg',
        title: 'Valles Marineris wall rock',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA09391',
      },
    ],
    description:
      'Valles Marineris is a system of interconnected canyons stretching east from the Tharsis volcanic bulge toward the Chryse Planitia lowlands. It is the largest canyon system in the Solar System. Most researchers interpret it as a large tectonic rift in the Martian crust that was later widened by landslides and erosion, although some eastern channels may record ancient water flow.',
    facts: [
      'The canyon system is roughly 3,900–4,000 km long — long enough to span the United States.',
      'Individual troughs are typically 50–100 km wide, and the central depression reaches about 600 km across.',
      'Its walls rise several kilometers high; the deepest parts lie roughly 7–9 km below the surrounding plateau.',
      'It formed mainly by tectonic rifting linked to the growth of the Tharsis bulge, not by a single river like the Grand Canyon.',
      'Landslides, wind action and possible ancient water flow have all modified the canyon walls and floor.',
    ],
    sources: [
      {
        label: 'IAU/USGS Gazetteer — Valles Marineris (Feature ID 6288)',
        url: 'https://planetarynames.wr.usgs.gov/Feature/6288',
      },
      {
        label: 'NASA Science — Mars Facts: Valles Marineris',
        url: 'https://science.nasa.gov/mars/facts/',
      },
      {
        label: 'USGS Astrogeology — Valles Marineris, the Grand Canyon of Mars',
        url: 'https://www.usgs.gov/centers/astrogeology-science-center/science/valles-marineris-grand-canyon-mars',
      },
    ],
    relatedEarth: {
      name: 'Grand Canyon, Arizona, USA',
      reason:
        'Both are spectacular canyon landscapes, but Valles Marineris is a tectonic rift far larger than the river-carved Grand Canyon.',
    },
    comparisonId: 'valles-grand-canyon',
  },
  {
    id: 'jezero-crater',
    name: 'Jezero Crater',
    category: 'Impact crater · Ancient lake',
    latitude: 18.41,
    longitude: 77.62,
    diameterKm: 47.5,
    shortDescription:
      'A crater on the western edge of Isidis Planitia that once held a lake and a river delta; now explored by the Perseverance rover.',
    images: [
      {
        src: 'https://images-assets.nasa.gov/image/PIA24331/PIA24331~small.jpg',
        title: "Perseverance's landing spot in Jezero Crater",
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA24331',
      },
      {
        src: 'https://images-assets.nasa.gov/image/PIA26378/PIA26378~medium.jpg',
        title: "Perseverance's mid-climb view of Jezero Crater",
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA26378',
      },
      {
        src: 'https://images-assets.nasa.gov/image/PIA24350/PIA24350~medium.jpg',
        title: 'Perseverance rover landing ellipse in Jezero Crater',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA24350',
      },
      {
        src: 'https://images-assets.nasa.gov/image/PIA25290/PIA25290~medium.jpg',
        title: 'Dust devils swirling across Jezero Crater',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA25290',
      },
    ],
    description:
      'Jezero Crater is an impact crater about 45 km across on the western margin of the Isidis basin. Orbital images show inlet and outlet valleys, a preserved river delta, and clay and carbonate minerals — evidence that a lake existed there around 3.5 billion years ago. Its ancient lake-delta system makes it one of the most promising places to search for signs of past microbial life.',
    facts: [
      'The crater is about 45 km in diameter and lies in the Nili Fossae region of Mars.',
      'A lake filled the crater roughly 3.5 billion years ago; river valleys entered from the west and an outlet drained to the east.',
      'The western delta contains clays and carbonates that can preserve organic matter on Earth.',
      'NASA’s Perseverance rover landed in Jezero Crater on 18 February 2021.',
      'Jezero’s name comes from a town in Bosnia and Herzegovina; in several Slavic languages, “jezero” means lake.',
    ],
    sources: [
      {
        label: 'IAU/USGS Gazetteer — Jezero (Feature ID 14300)',
        url: 'https://planetarynames.wr.usgs.gov/Feature/14300',
      },
      {
        label: 'NASA Science — Mars 2020 Perseverance Rover',
        url: 'https://science.nasa.gov/mission/mars-2020-perseverance/',
      },
      {
        label: 'NASA/JPL — Jezero Crater landing site',
        url: 'https://www.jpl.nasa.gov/news/press_kits/mars_2020/landing/mission/landing_site',
      },
    ],
    relatedEarth: {
      name: 'Mississippi River Delta, Louisiana, USA',
      reason:
        'Both are river deltas built where sediment-laden water entered a standing body of water, preserving layered deposits.',
    },
    comparisonId: 'jezero-mississippi-delta',
  },
  {
    id: 'gale-crater',
    name: 'Gale Crater',
    category: 'Impact crater · Layered mound',
    latitude: -5.37,
    longitude: 137.81,
    diameterKm: 154,
    shortDescription:
      'A 154 km crater containing Aeolis Mons (Mount Sharp), whose layered rocks record ancient wet environments; explored by Curiosity.',
    images: [
      {
        src: 'https://images-assets.nasa.gov/image/PIA15292/PIA15292~medium.jpg',
        title: 'Mount Sharp inside Gale Crater',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA15292',
      },
      {
        src: 'https://images-assets.nasa.gov/image/PIA16099/PIA16099~medium.jpg',
        title: 'Getting to know Mount Sharp',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA16099',
      },
      {
        src: 'https://images-assets.nasa.gov/image/PIA17064/PIA17064~medium.jpg',
        title: 'From Glenelg to Mount Sharp',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA17064',
      },
      {
        src: 'https://images-assets.nasa.gov/image/PIA19039/PIA19039~medium.jpg',
        title: 'Curiosity walkabout at Pahrump Hills',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA19039',
      },
    ],
    description:
      'Gale Crater is a large impact crater near the Martian equator, chosen as the landing site for NASA’s Curiosity rover. In its center stands Aeolis Mons, informally called Mount Sharp, a layered mountain about 5.5 km high. The layers preserve a record of ancient lakes and streams, with clay-rich deposits near the base and sulfate-rich layers above that record a shift toward drier conditions.',
    facts: [
      'Gale Crater is about 154 km in diameter and formed roughly 3.5–3.8 billion years ago.',
      'Aeolis Mons (Mount Sharp) rises about 5.5 km above the crater floor.',
      'The layered mound is more than twice as thick as the stack of rocks exposed in the Grand Canyon.',
      'Curiosity landed in Gale Crater in August 2012 and found evidence of ancient lakes and habitable conditions.',
      'Clay minerals at the base of the mound give way upward to sulfates, recording a transition from wetter to drier environments.',
    ],
    sources: [
      {
        label: 'IAU/USGS Gazetteer — Gale (Feature ID 2071)',
        url: 'https://planetarynames.wr.usgs.gov/Feature/2071',
      },
      {
        label: 'NASA Science — Curiosity Mars Rover (MSL)',
        url: 'https://science.nasa.gov/mission/msl-curiosity/',
      },
      {
        label: 'NASA Science — Perspective View of Layered Mound in Gale Crater',
        url: 'https://science.nasa.gov/resource/perspective-view-of-layered-mound-in-gale-crater-mars',
      },
    ],
    relatedEarth: {
      name: 'Grand Canyon, Arizona, USA',
      reason:
        'Both expose thick stacks of layered sedimentary rock, though Gale’s mound records an ancient lake and wind processes rather than a single river cut.',
    },
    comparisonId: 'gale-grand-canyon',
  },
  {
    id: 'hellas-planitia',
    name: 'Hellas Planitia',
    category: 'Impact basin',
    latitude: -42.43,
    longitude: 70.5,
    diameterKm: 2299,
    shortDescription:
      'A giant impact basin in the southern highlands containing the lowest point on Mars.',
    images: [
      {
        src: 'https://images-assets.nasa.gov/image/PIA21310/PIA21310~small.jpg',
        title: 'Hellas Planitia in false color',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA21310',
      },
      {
        src: 'https://images-assets.nasa.gov/image/PIA13097/PIA13097~medium.jpg',
        title: 'Intra-crater structure in northwest Hellas basin',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA13097',
      },
      {
        src: 'https://images-assets.nasa.gov/image/PIA14486/PIA14486~medium.jpg',
        title: 'Hellas dunes',
        credit: 'NASA/JPL-Caltech',
        href: 'https://images.nasa.gov/details/PIA14486',
      },
    ],
    description:
      'Hellas Planitia is the floor of the Hellas impact basin, one of the largest and oldest impact structures on Mars. Roughly 2,300 km across, the basin is deep enough that atmospheric pressure at its floor is noticeably higher than on the surrounding highlands. Its floor includes the lowest elevations on Mars, and the region is frequently obscured by dust, clouds and seasonal frost.',
    facts: [
      'The basin is about 2,300 km across, roughly a third of Mars’s diameter.',
      'Its floor lies about 7 km below the Martian topographic datum; the lowest point is roughly 8.2 km below the datum.',
      'Hellas formed by a giant impact around 4 billion years ago.',
      'Because the basin floor is so deep, atmospheric pressure there is higher than on the surrounding highlands.',
      'Unusual landforms on the basin floor include “banded terrain” and possible ice-rich deposits whose origins are still debated.',
    ],
    sources: [
      {
        label: 'IAU/USGS Gazetteer — Hellas Planitia (Feature ID 2432)',
        url: 'https://planetarynames.wr.usgs.gov/Feature/2432',
      },
      {
        label: 'NASA Science — To Great Depths (Hellas basin)',
        url: 'https://science.nasa.gov/photojournal/to-great-depths',
      },
      {
        label: 'NASA Science — Topographic Map of Hellas Planitia',
        url: 'https://science.nasa.gov/resource/topographic-map-of-hellas-planitia',
      },
    ],
    relatedEarth: {
      name: 'Chicxulub impact structure, Yucatán, Mexico',
      reason:
        'Both are giant impact basins, but Hellas is much larger and remains an open, deeply depressed basin rather than a buried crater.',
    },
    comparisonId: 'hellas-chicxulub',
  },
]

export function getMarsPlaceById(id) {
  return marsPlaces.find((place) => place.id === id) ?? null
}
