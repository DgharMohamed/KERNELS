# Planetary Rover Logistics & Analog Training Simulator (Operation Red Rock)

A 3D simulation game built for the NASA Space Apps Challenge. Players operate an autonomous planetary rover ("robocart") across scientifically accurate terrain on Earth analog sites and Mars.

## Overview

The simulator models logistical missions—transporting cargo between research outposts and collecting geological samples—using real NASA and USGS planetary datasets.

### Earth-to-Space Training Loop

- **Stage 1 (Earth Analog Training)**: Pilot rovers at terrestrial analog sites under Earth gravity (9.81 m/s²) to calibrate handling, terrain navigation, and surface friction.
- **Stage 2 (Planetary Deployment)**: Deploy on Mars under reduced gravity (3.72 m/s²) where lower traction, altered braking distances, and extreme temperatures test mission execution.

## Simulation Mechanics & Datasets

- **Open Datasets**: Terrain elevation, surface mineral friction, and weather metrics are derived from open space agency data:
  - [NASA Mars Trek](https://trek.nasa.gov/mars/) & [NASA Moon Trek](https://trek.nasa.gov/moon/): Digital Elevation Models (DEMs) and surface topography.
  - [MRO HiRISE](https://hirise.lpl.arizona.edu/): High-resolution surface imaging and boulder hazard mapping.
  - [LRO LOLA](https://lola.gsfc.nasa.gov/): Lunar laser altimetry data.
  - [USGS EarthExplorer](https://earthexplorer.usgs.gov/): Terrestrial analog terrain and rock composition.
  - [NASA POWER](https://power.larc.nasa.gov/): Solar radiation, wind vectors, and surface meteorology.
- **Physics Telemetry**: Speed, traction, drift, suspension stress, and power consumption calculate dynamically based on slope angle (θ), surface friction (μ), ambient temperature, and gravity (g).
- **Mission Constraints**: Active management of battery reserves, cargo integrity, and environmental hazards (boulders, loose regolith, dust storms).
- **Judge Comparison Panel**: Side-by-side Earth vs. Space data comparison view for evaluation.

## MVP Scope

Focused time-boxed hackathon scope featuring 1 to 3 complete missions:
- Core mission loop: Atacama Desert analog training paired with Gale Crater Mars deployment.
- Workshop hardware configuration and telemetry monitoring.
- Interactive mission control hub with pre-flight briefings.

## Tech Stack

- Frontend: React 19, TypeScript, Vite
- Graphics & Simulation: Three.js (WebGL 3D Engine), HTML5 Canvas
- Styling: Tailwind CSS, custom HUD styles

## Project Structure

```text
operation-red-rock/
├── public/assets/       # Topography maps, video briefings, and textures
├── src/                 # Application source
├── hub.js               # Mission hub controller and telemetry bridge
├── hubData.js           # Datasets, mission configurations, and rover attributes
├── hub.css              # Mission control UI styles
├── index.html           # Main shell and game canvas viewport
├── INTEGRATION.md       # Game engine integration interface
└── package.json         # Dependencies and build scripts
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation & Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Scripts

- `npm run dev`: Start local development server.
- `npm run build`: Build production assets.
- `npm run preview`: Preview production build.
- `npm run lint`: Run TypeScript type checks (`tsc --noEmit`).

## License

Apache-2.0
