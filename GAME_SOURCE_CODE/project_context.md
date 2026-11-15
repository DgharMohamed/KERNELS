# Project Overview: Low-Poly Planetary Rover Adventure

## 1. Core Concept

A third-person 3D rover exploration and logistics game designed to run in a
web browser. The player pilots a compact rover across an Earth analog site,
learns the mission's terrain and equipment constraints, then takes those
lessons into a planetary deployment on Mars or the Moon.

The presentation is approachable and game-like rather than a strict engineering
simulator: readable low-poly terrain, a responsive follow camera, clear rover
feedback, and short objectives make the science understandable through play.
The current map is a user-provided Gale Crater topographic mesh. Keep mission
routes and location-specific objectives open until they are defined; do not
invent site measurements or present the model's exaggerated relief as actual
elevation.

## 2. Target and Visual Direction

- **Platform:** Web browser (HTML5/WebGL 2); keep rendering and asset choices
  compatible with web export and modest hardware.
- **Dimension and camera:** 3D, third-person, with a camera following behind
  and above the rover. The player should be able to look around without losing
  awareness of the route.
- **Art style:** Low-poly, clean silhouettes, simple materials, restrained
  colors, and readable terrain landmarks. Use stylized art rather than
  photorealistic assets.
- **Rover scale reference:** Use a Perseverance-class rover as an approximate
  size reference: 3 m long, 2.7 m wide, 2.2 m tall, with six wheels about
  0.525 m in diameter. Keep the model an original low-poly utility rover, not
  an exact replica. These proportions follow [NASA's rover specifications](https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/).
- **Map scale and provenance:** The provided model is 11 cm across at its
  default print size, represents approximately 200 km, and specifies a
  1:1,900,000 scale (1 cm = 19 km). Its longest horizontal GLB axis is
  approximately 142.243 source units, so the game map uses about 1,469.32 m
  per source unit (about 209 km across). The mesh has 3x vertical exaggeration;
  height and slope telemetry derived from it reflect that exaggeration.
  Data credit supplied with the model: K. Gwinner, J. Oberst, R. Jaumann,
  G. Neukum, ESA/DLR/FU Berlin; topography derived from the ESA Mars Express
  HRSC camera.
- **Terrain look:** The current 2 km slice uses a lightweight, world-space
  Godot shader for red-oxide dust, fine gravel, and slope-exposed rock, with
  matte lighting. Its colors and surface detail are illustrative, not a
  scientific composition or elevation map.
- **Rock asset:** `res://assets/mars_rocks.glb` contains 15 low-poly rocks.
  Attribution: "Mars Rocks" by Ivan Vakulko, licensed CC BY 4.0
  (https://sketchfab.com/3d-models/mars-rocks-9f5c946255a24f1cb630ea95dceea587).
  Preserve attribution in distributed builds.
- **Rock scatter:** The current rock field targets 12,000 visual rocks, with
  small 0.15–0.30 m stones distributed widely and 12% large 1.5–2.5 m
  boulders to make more routes impassable. Small field rocks may appear
  beyond 28 m from spawn; large boulders stay beyond 45 m. Small-rock step
  surfaces are combined into one static concave shape and fit the rover's
  0.35 m step-up limit; large rocks use convex mesh colliders. These sizes
  and counts are gameplay-tuned, not measured Gale Crater abundance.
  Curiosity observations describe varied sedimentary materials across Gale
  (https://ntrs.nasa.gov/citations/20150001954); no single count is inferred
  for this cropped terrain.
- **Readability:** Make traversable routes, steep slopes, loose ground,
  hazards, objectives, and the rover's state distinguishable at a glance.
- **Playable map slice:** The prototype clips a 2 km × 2 km region from the
  Gale Crater mesh, centered on the current rover spawn, to keep early routes
  compact. This is a runtime crop; the source GLB remains unchanged. Preserve
  the map's calibrated world scale and 3x vertical exaggeration, and do not
  invent map-specific features. Invisible collision walls follow the cropped
  region's four edges so the rover cannot leave the playable area.

## 3. MVP Scope and Mission Loop

Prioritize one complete and polished mission loop:

1. Brief the player on the destination, cargo or sample, and key constraints.
2. Drive through an Earth analog training route and learn how terrain affects
   rover handling.
3. Complete a planetary deployment route that reuses the learned skills but
   introduces the destination's distinct gravity and environmental conditions.
4. Deliver cargo or collect and return a sample, then show a concise debrief
   with route, time, battery, and cargo/sample outcome.

Keep the first playable experience short and focused. Add one or two further
missions only after the core loop is stable. Avoid building a large open world,
complex crafting, or extensive menus for the MVP.

## 4. Gameplay and Simulation

The rover is the player's character and primary vehicle. Driving should feel
predictable and responsive, with speed, turning, braking, and traction offering
enough feedback for players to make informed route choices.

Mission mechanics may include:

- **Terrain:** Surface type and slope influence grip, speed, stability, and
  energy use. Use clear visual cues and consistent gameplay effects.
- **Rover obstacle handling:** The prototype's rover uses a gameplay-tuned
  0.35 m step-up limit for small obstacles. Its visual chassis leans from
  terrain height samples at the four wheel positions; this is illustrative,
  not a measured Curiosity mobility model. The visual body also has subtle
  speed bob and a damped jiggle on side impacts, without changing the rover's
  physics collision body.
- **Gravity:** Earth, Mars, or Moon gravity can affect weight, traction,
  braking, and stability where these differences matter to play. Keep the
  model intentionally simple and explain its effects to the player.
- **Power and temperature:** Battery reserve and temperature can constrain
  mission choices; show warnings before they become mission-ending.
- **Cargo and samples:** Rough driving or hazards can put cargo integrity or
  sample safety at risk.
- **Hazards:** Use a small set of legible, map-appropriate hazards rather than
  adding hazards without a gameplay purpose.
- **Objectives:** Favor clear delivery, navigation, and sample-return tasks
  with visible waypoints and optional exploration rewards.

Distinguish simplified gameplay models from real measurements. Do not present
invented friction, temperature, or terrain values as NASA observations.

## 5. Earth-to-Space Structure and Data Provenance

Preserve the Earth-analog training followed by planetary deployment structure.
Use real agency or public datasets only when the selected map and data source
are known and documented. Potential sources include NASA Mars/Moon Trek,
HiRISE, LRO LOLA, USGS, and NASA POWER, subject to availability and suitability
for the chosen location.

For any real-world data used, record its source, units, location, and
transformations. Clearly label illustrative or gameplay-tuned values as such.
The game should communicate the relationship between the Earth training route
and planetary mission without implying that every gameplay parameter is a
scientifically exact simulation.

## 6. Controls and Interface Direction

Use keyboard driving controls suitable for desktop browsers, with optional
gamepad support if time allows. Keep steering and acceleration easy to learn;
provide camera-look controls that do not conflict with driving. Final bindings
should be chosen when the first playable prototype is scoped.

The HUD should prioritize:

- Current objective and next waypoint
- Battery and mission-critical cargo/sample condition
- A small set of relevant terrain or environmental warnings
- A brief mission/debrief summary

Keep the HUD unobtrusive so the rover and landscape remain the focus.

## 7. Web Performance and Project Boundaries

Design for browser performance from the start: modest geometry and texture
budgets, simple materials, limited real-time effects, and small playable
spaces. Prefer reusable low-poly assets and efficient lighting over expensive
post-processing or large worlds.

This document describes the intended game and current map calibration. A
Godot prototype is in progress; keep future implementation focused on the
playable mission loop. The project currently has a Web-compatible renderer
setting; verify the eventual export configuration in Godot before release.
