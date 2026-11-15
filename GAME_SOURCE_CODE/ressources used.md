# Ressources Used

Checked against the project files currently in the workspace on 2026-11-15.
This records evidence in the project; it cannot confirm whether someone
accessed a website outside the repository.

## Resources from the supplied list

| Resource | Finding |
| --- | --- |
| [NASA Earthdata Search](https://search.earthdata.nasa.gov/) | No project citation, imported product, or data file found. |
| [NASA Worldview](https://worldview.earthdata.nasa.gov/index.html) | No project citation, imported product, or data file found. |
| [NASA Planetary Data System (PDS)](https://pds.nasa.gov/) | Referenced by the science-card plan and in-game labels. The sample and telemetry values are hardcoded, but no PDS product identifier, source URL, or downloaded data file was found. Treat the values as source-unverified. |
| [NASA LRO data](https://pds-geosciences.wustl.edu/missions/lro/) | No project citation, imported product, or data file found. |
| [NASA LRO Diviner data](https://pds-geosciences.wustl.edu/missions/lro/diviner.htm) | No project citation, imported product, or data file found. |
| [CSA RADARSAT Constellation Mission data](https://donnees-data.asc-csa.gc.ca/en/dataset/rcm) | No project citation, imported product, or data file found. |
| [CSA RADARSAT-1 data](https://donnees-data.asc-csa.gc.ca/en/dataset/radarsat1) | No project citation, imported product, or data file found. |
| [CSA SAR Python tutorial](https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial) | No project citation or code adapted from the tutorial found. |
| [ESA Copernicus Data Space Ecosystem](https://dataspace.copernicus.eu/) | No project citation or imported product found. |
| [ESA Open Science Catalog](https://opensciencedata.esa.int/) | No project citation or imported product found. The project's HRSC map provenance does not identify this catalog as its source. |
| [JAXA G-Portal](https://gportal.jaxa.jp/gpr/index/index) | No project citation, imported product, or data file found. |

## PDS references that need source verification

The project displays CheMin/APXS and REMS labels, and
[`scripts/sample_site.gd`](./scripts/sample_site.gd) contains hardcoded mineral
percentages and environmental readings. [`scripts/hud.gd`](./scripts/hud.gd)
also supplies fixed temperature and pressure values and a generated wind
value. These are presented in the game as NASA/Curiosity data, but the
repository does not identify the underlying PDS products or dataset IDs.

[`mission_quest_plan.md`](./mission_quest_plan.md) describes a planned
`assets/data/nasa_gale_science.json`; no such data file is present in the
workspace. The PDS entries above are therefore references, not verified
ingestion of those products.

## Other sources documented in the project

- **Gale Crater topography:** The user-provided
  [`assets/gale_crater.glb`](./assets/gale_crater.glb) is credited to K.
  Gwinner, J. Oberst, R. Jaumann, and G. Neukum, with topography derived from
  ESA Mars Express HRSC data. The project does not record which of the listed
  portals supplied the file.
- **Rover scale reference:** [`project_context.md`](./project_context.md)
  cites [NASA Perseverance rover specifications](https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/).
- **Gale geology context:** [`project_context.md`](./project_context.md)
  cites a [NASA Technical Reports Server report](https://ntrs.nasa.gov/citations/20150001954)
  for qualitative context; the project explicitly does not infer a rock count
  from it.
- **Rock model:** The project uses
  [`assets/mars_rocks.glb`](./assets/mars_rocks.glb), credited in
  [`project_context.md`](./project_context.md) to Ivan Vakulko under CC BY 4.0.
