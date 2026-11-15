# Resources & Data Documentation
## Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars

This document provides a comprehensive, verified catalog of all scientific datasets, orbital telemetry, Digital Elevation Models (DEMs), satellite imagery, climate measurements, and peer-reviewed literature utilized in **Operation Red Rock**.

---

## Quick Reference: Data Sources & Repositories

| Domain | Instrument / Mission | Source Agency | Catalog / Dataset ID | Primary Access URL |
| :--- | :--- | :--- | :--- | :--- |
| **Gale Crater Topography** | MOLA (MGS) & HiRISE (MRO) | NASA / JPL / WUSTL PDS | `MOLA-HRSC-Gale-DTM-v1` | [NASA PDS Geosciences](https://pds-geosciences.wustl.edu/missions/msl/) |
| **Mars In-Situ Climate** | REMS Weather Station (MSL) | NASA / CAB (CSIC-INTA) | `MSL-REMS-EDR-V1.0` | [NASA PDS Atmospheres](https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/curiosity/rems.html) |
| **Interactive Mars GIS** | Mars Trek | NASA Solar System Treks | Mars Basemap & Layers | [NASA Mars Trek](https://trek.nasa.gov/mars/) |
| **High-Res Surface Imaging** | HiRISE Camera (MRO) | NASA / University of Arizona | MSL Traverse Maps | [HiRISE Operations Center](https://hirise.lpl.arizona.edu/) |
| **McMurdo Dry Valleys** | Terra ASTER Satellite | NASA / JPL-Caltech | `PIA12461` | [NASA JPL Photojournal](https://photojournal.jpl.nasa.gov/catalog/PIA12461) |
| **Salar de Atacama** | Terra ASTER Multispectral | NASA / JPL-Caltech | `PIA23420` | [NASA JPL Photojournal](https://photojournal.jpl.nasa.gov/catalog/PIA23420) |
| **Dumont Dunes Rover Tests** | Curiosity Scarecrow Trials | NASA / JPL-Caltech | `PIA15682` | [NASA JPL Photojournal](https://photojournal.jpl.nasa.gov/catalog/PIA15682) |
| **Mojave Desert Imagery** | Armstrong Aerial Survey | NASA Armstrong FRC | `ED04-0056-061` | [NASA Images Archive](https://images.nasa.gov/details/ED04-0056-061) |
| **Mojave Satellite Data** | Terra ASTER Satellite | NASA / JPL-Caltech | `PIA03444` | [NASA JPL Photojournal](https://photojournal.jpl.nasa.gov/catalog/PIA03444) |
| **Utah Navajo Sandstone** | ISS Expedition 15 Photography | NASA JSC Earth Science | `ISS015-E-7852` | [NASA Gateway to Astronaut Photos](https://eol.jsc.nasa.gov/SearchPhotos/photo.pl?mission=ISS015&roll=E&frame=7852) |
| **Solar & Surface Weather** | NASA POWER Project | NASA Langley Research Center| SSE Solar & Wind Models | [NASA POWER](https://power.larc.nasa.gov/) |
| **Terrestrial Elevation** | 3D Elevation Program (3DEP) | USGS EarthExplorer | National Elevation Dataset | [USGS EarthExplorer](https://earthexplorer.usgs.gov/) |

---

## 1. Martian Topography & Digital Elevation Models (DEMs)

### 1.1 Gale Crater Basin & Mount Sharp (Aeolis Mons)
* **Spacecraft Missions**:
  * **Mars Global Surveyor (MGS)**: Mars Orbiter Laser Altimeter (MOLA).
  * **Mars Reconnaissance Orbiter (MRO)**: High Resolution Imaging Science Experiment (HiRISE) and Context Camera (CTX).
  * **Mars Express (ESA)**: High Resolution Stereo Camera (HRSC).
* **Scientific Parameters Used in Simulation**:
  * **Crater Rim Diameter**: 154 km (96 mi).
  * **Crater Floor Depth**: -4,500 m below the Martian orbital datum.
  * **Mount Sharp Central Mound Height**: +5,500 m elevation above the northern crater floor (Peace Vallis fan).
  * **Mound-to-Basin Ratio**: **0.36** ($\approx 55 \text{ km} / 154 \text{ km}$).
  * **Geological Evolution**: Asteroid impact rebound during the Noachian period ($\sim 3.8 - 3.5$ Ga), followed by lacustrine sedimentation and subsequent aeolian deflation that excavated the moat.
* **NASA Archive Links**:
  * NASA Planetary Data System (PDS) Geosciences Node: [https://pds-geosciences.wustl.edu/missions/msl/](https://pds-geosciences.wustl.edu/missions/msl/)
  * NASA JPL Gale Crater Perspective Altimetry (`PIA15292`): [https://photojournal.jpl.nasa.gov/catalog/PIA15292](https://photojournal.jpl.nasa.gov/catalog/PIA15292)
  * NASA Solar System Treks (Mars Trek DEM Extractor): [https://trek.nasa.gov/mars/](https://trek.nasa.gov/mars/)

---

## 2. In-Situ Martian Climate & Atmospheric Telemetry

### 2.1 Curiosity Rover Environmental Monitoring Station (REMS)
* **Instrument Overview**:
  The REMS sensor suite on board NASA's Curiosity rover (MSL) provides daily in-situ atmospheric records from the floor of Gale Crater.
* **Telemetry Data Points Integrated**:
  * **Diurnal Air Temperature Range**: $-75^\circ\text{C}$ to $0^\circ\text{C}$ (Annual average: $-60^\circ\text{C}$).
  * **Ground Surface Temperature**: $-90^\circ\text{C}$ (night) to $+15^\circ\text{C}$ (mid-day sun).
  * **Barometric Surface Pressure**: $7.5\text{ hPa}$ to $9.2\text{ hPa}$ ($\sim 0.75 - 0.92\%$ of Earth standard atmospheric pressure, reflecting seasonal carbon dioxide freezing at the polar caps).
  * **Relative Humidity**: $< 5\%$ during daytime; local nighttime frost spikes.
  * **Liquid Precipitation**: $0.0\text{ mm/year}$ (liquid water is thermodynamically unstable on the modern surface).
  * **Ultraviolet Radiation (UVM Sensor)**: Intense unattenuated UV radiation due to lack of a stratospheric ozone layer.
* **NASA Archive Links**:
  * NASA PDS Atmospheres Node REMS Data: [https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/curiosity/rems.html](https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/curiosity/rems.html)
  * NASA Science MSL Instruments: [https://science.nasa.gov/mission/msl-curiosity/science-instruments/](https://science.nasa.gov/mission/msl-curiosity/science-instruments/)

---

## 3. Terrestrial Earth Analog Locations & Remote Sensing

Planetary scientists employ specialized Earth analog environments to isolate and test specific mission aspects before space deployment.

### 3.1 Inselberg Pit (Navajo Sandstone · Utah, USA) — *Terrain Morphology Analog*
* **Morphological Characteristics**:
  * Weathering pit with an isolated central bedrock mound/pillar surrounded by a lower circular moat depression.
  * **Feature Dimensions**: Central pillar height: $\sim 12\text{ m}$; Moat diameter: $\sim 45\text{ m}$; Depression depth: $\sim 6\text{ m}$.
  * **Mound-to-Moat Ratio**: **0.35** (reproduces Gale Crater's **0.36** ratio through moisture weathering and wind deflation).
* **NASA & Academic Reference**:
  * NASA Astronaut Photography: [NASA ISS015-E-7852](https://eol.jsc.nasa.gov/SearchPhotos/photo.pl?mission=ISS015&roll=E&frame=7852)
  * Scientific Paper: Chan, M. A. & Netoff, D. I. (2017), *Geophysical Research Letters*, [DOI: 10.1002/2017GL072978](https://doi.org/10.1002/2017GL072978).

### 3.2 McMurdo Dry Valleys (Antarctica) — *Cold Polar Desert Climate Analog*
* **Environmental Characteristics**:
  * Earth's closest climate counterpart to modern Martian cold aridity.
  * **Mean Annual Temperature**: $-19.8^\circ\text{C}$ (winter lows drop below $-50^\circ\text{C}$).
  * **Precipitation**: $< 10\text{ mm/year}$ liquid equivalent (kept ice-free by katabatic winds).
  * **Relative Humidity**: $10\% - 25\%$.
  * **Surface Conditions**: Sub-zero permafrost, desiccated soils, and hypolithic endolithic microbial communities.
* **NASA Archive Links**:
  * NASA Terra ASTER Satellite Imagery: [NASA JPL PIA12461](https://photojournal.jpl.nasa.gov/catalog/PIA12461)
  * NASA Earth Observatory Antarctic Climate Record: [Antarctica's Dry Valleys](https://earthobservatory.nasa.gov/images/84488/antarcticas-dry-valleys)

### 3.3 Dumont Dunes (Mojave Desert · California, USA) — *Rover Traction Analog*
* **Field Test Application**:
  * Active wind-sculpted sand dunes used by NASA JPL to test the Curiosity "Scarecrow" lightweight mobility rover.
  * Evaluated wheel cleat traction, sand sinkage, and slip-recovery algorithms on $30^\circ - 33^\circ$ slip faces.
* **NASA Archive Link**:
  * NASA JPL Photojournal (`PIA15682`): [https://photojournal.jpl.nasa.gov/catalog/PIA15682](https://photojournal.jpl.nasa.gov/catalog/PIA15682)

### 3.4 Salar de Atacama (Atacama Desert · Chile) — *Hyper-Aridity & Sensor Calibration*
* **Environmental Characteristics**:
  * Hyper-arid salt flats with annual rainfall of $\sim 2\text{ mm/year}$ in the core.
  * **Mean Annual Temperature**: $+16.5^\circ\text{C}$ (Summer peak: $+24^\circ\text{C}$).
  * **Role in Research**: Serves as a primary testbed for life-detection instruments and extreme desiccation resistance, though failing the sub-zero thermal requirements of Mars.
* **NASA Archive Links**:
  * NASA Terra ASTER Multispectral Archive (`PIA23420`): [https://photojournal.jpl.nasa.gov/catalog/PIA23420](https://photojournal.jpl.nasa.gov/catalog/PIA23420)
  * NASA Earth Observatory Salar de Atacama: [https://earthobservatory.nasa.gov/images/146033/salar-de-atacama](https://earthobservatory.nasa.gov/images/146033/salar-de-atacama)

### 3.5 Mojave Desert (California, USA) — *Basin-and-Range Geology*
* **Environmental Characteristics**:
  * Regional tectonic basin with extreme summer temperatures ($+38^\circ\text{C}$ to $+49^\circ\text{C}$) and $50 - 150\text{ mm/year}$ precipitation.
  * NASA Armstrong Flight Research Center aerial surveys and radar ground truth.
* **NASA Archive Links**:
  * NASA Armstrong Image Gallery: [NASA ED04-0056-061](https://images.nasa.gov/details/ED04-0056-061)
  * NASA Terra ASTER Multispectral: [NASA PIA03444](https://photojournal.jpl.nasa.gov/catalog/PIA03444)

---

## 4. Simulation Map Assets & Local Textures

The simulation assets located in `/public/assets/maps/` are generated directly from NASA orbital observation models:

| Asset File | Resolution / Source | Scientific Mapping Purpose |
| :--- | :--- | :--- |
| `public/assets/maps/mars_gale_crater.jpg` | NASA MRO CTX / HiRISE composite | Topographic heightmap & surface texture for the primary Gale Crater rover campaign. |
| `public/assets/maps/mars_riverbed.jpg` | NASA HRSC / MOLA paleolake channels | Models ancient lacustrine and alluvial fan networks (Peace Vallis). |
| `public/assets/maps/mars_training_sector.jpg` | USGS / NASA Earth Observing System | Terrestrial analog testing area (calibrated to Earth gravity $9.81\text{ m/s}^2$). |
| `public/assets/maps/mars_dust_storm.jpg` | NASA MRO MARCI weather camera | High-altitude atmospheric optical depth ($\tau$) and diffuse dust storm conditions. |

---

## 5. Peer-Reviewed Scientific Literature

The simulation mechanics, environmental rules, and challenge questions are directly informed by the following peer-reviewed publications:

1. **Terrain Morphology Analog Ground Truth**:
   * **Citation**: Chan, M. A., & Netoff, D. I. (2017). *Navajo Sandstone weathering pits with central mounds: Morphological analogs for Gale Crater's Mount Sharp on Mars*. **Geophysical Research Letters**, 44(8), 3505–3512.
   * **DOI**: [10.1002/2017GL072978](https://doi.org/10.1002/2017GL072978)
   * **Significance**: Established the $0.35$ vs $0.36$ ratio proving that central mound/moat structures form on Earth through moisture sapping and wind deflation.

2. **Gale Crater Ancient Habitable Environment**:
   * **Citation**: Grotzinger, J. P., et al. (2014). *A Habitable Fluvio-Lacustrine Environment at Yellowknife Bay, Gale Crater, Mars*. **Science**, 343(6169), 1242777.
   * **DOI**: [10.1126/science.1242777](https://doi.org/10.1126/science.1242777)
   * **Significance**: Documented mudstone deposits and clay minerals confirming ancient fresh-water lake conditions in Gale Crater.

3. **In-Situ Atmospheric Environmental Monitoring**:
   * **Citation**: Gómez-Elvira, J., et al. (2012). *REMS: The Environmental Sensor Suite for the Mars Science Laboratory Rover*. **Space Science Reviews**, 170(1–4), 583–640.
   * **DOI**: [10.1007/s11214-012-9921-1](https://doi.org/10.1007/s11214-012-9921-1)
   * **Significance**: Provided technical design, measurement accuracy, and calibration parameters for Curiosity's REMS weather instruments.

---

## 6. How to Fetch & Inspect Open NASA Data

All referenced datasets are publicly accessible under NASA's open-access data policy:

1. **Querying NASA PDS Geosciences Archives**:
   * Visit the [NASA PDS Geosciences MSL Release Node](https://pds-geosciences.wustl.edu/missions/msl/).
   * Select `Curiosity` $\rightarrow$ `HiRISE DTM` or `MOLA Elevation Model`.
   * Download `.IMG` or `.GeoTIFF` files for GIS processing in QGIS or GDAL.

2. **Querying REMS Weather Telemetry via REST API**:
   * Direct weather logs can be queried through the NASA Planetary Data System APIs or the Spanish Astrobiology Center (CAB) public weather summaries:
   * Portal: [https://pds-atmospheres.nmsu.edu/](https://pds-atmospheres.nmsu.edu/)

3. **NASA Open Imagery API**:
   * Public satellite photography can be retrieved via the NASA Image and Video Library API:
   ```bash
   curl "https://images-api.nasa.gov/search?q=Gale%20Crater&media_type=image"
   ```

---

## License & Attribution Notice
* **NASA Data & Imagery**: NASA imagery, audio, video, and computer files are in the public domain in the United States under 17 U.S.C. § 105.
* **Disclaimer**: This simulation was developed for the NASA Space Apps Challenge and planetary education. The game is not officially affiliated with or endorsed by NASA or the Jet Propulsion Laboratory.
