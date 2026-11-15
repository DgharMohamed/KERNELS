# Godot 4.7+ Project Guidelines for AI Agents

These standards apply to all contributors and coding agents working in this
project. The project targets Godot 4.7+.

## Project direction

- Read `project_context.md` before planning or implementing game features; it
  is the detailed reference for the concept, simulation goals, datasets, and
  hackathon constraints.
- The game is a low-poly, third-person 3D rover exploration and logistics game
  for web browsers.
  Keep the MVP focused on one complete, polished mission loop; consider more
  missions only after it is stable and presentable.
- Preserve the Earth-analog training followed by planetary deployment
  structure. Make driving responsive and readable, with environmental factors
  such as gravity, slope, traction, temperature, battery, cargo integrity, and
  hazards informing route choices where appropriate.
- The current map is `res://assets/gale_crater.glb`, a Gale Crater
  topographic model derived from ESA Mars Express HRSC data. Its stated print
  scale is 1:1,900,000, with 3x vertical exaggeration; do not report its
  exaggerated relief as true elevation. Treat scientific accuracy and data
  provenance as requirements for any real-world data used.

## Project Configuration & Architecture

- **Target Platform & Renderer:** Web (HTML5 / WebGL2). The renderer is
  `gl_compatibility` (`rendering/renderer/rendering_method = "gl_compatibility"`).
  Do NOT change to Forward+ or Mobile as they require Vulkan and will fail on Web.
- **Display & Resolution:**
  - Viewport: `1280 x 720` (16:9).
  - Preserve the existing web-friendly display configuration unless a
    requested implementation change requires otherwise.
- **Art Style & Camera Perspective:**
  - Low-poly 3D with clean silhouettes, simple materials, and readable terrain.
  - Third-person camera follows behind and above the rover; allow camera look
    without obscuring route awareness.
  - Keep geometry, textures, materials, and effects modest for browser
    performance.
- **Input Map:**
  - Use clear keyboard driving controls and non-conflicting camera-look
    controls. Set final bindings when implementation is requested.
- **Directory Layout:**
  - `res://scenes/`: Scene files (.tscn). Main entry point: `res://scenes/main.tscn`.
  - `res://scripts/`: Strictly typed GDScript (.gd).
  - `res://assets/art/`: Low-poly models, textures, and UI assets.
  - `res://assets/audio/`: Web-optimized audio (OGG Vorbis, MP3).


## Core principles

- **Strong typing:** Use explicit static types for GDScript variables,
  parameters, return values, and exported properties. For example,
  `var health: int = 100` and
  `func take_damage(amount: int) -> void`. Avoid unnecessary casts and
  untyped variants.
- **Scene composition:** Inspect the existing scene hierarchy using the
  connected Godot AI MCP tools before creating or modifying nodes. Build from
  focused, reusable nodes and child scenes; never put unrelated systems into
  one script or scene.
- **Component-based design:** Separate concerns (for example, hurtboxes, UI
  controllers, and stats) into modular scenes and components. Use signals and
  explicit interfaces for decoupled communication instead of rigid node-path
  strings or tightly coupled cross-scene references.
- **Safety:** Core configuration files such as `project.godot` and the
  `.godot/` directory are off-limits for automated patching. Use the editor UI
  for project-wide settings and ask before changes requiring those files.

## Implementation

- Read relevant files and follow existing project patterns before editing.
- Keep changes focused on the request. Preserve unrelated work and do not
  overwrite or discard changes made by another contributor or agent.
- Prefer existing helpers and focused reusable components over duplicating
  logic or introducing unnecessary abstractions.
- Do not add credentials, secrets, or machine-specific settings.

## Verification and testing

- After writing or modifying scripts or scenes, invoke Godot AI scene tests,
  validation checks, or an appropriate test suite to catch parse and runtime
  errors.
- Save scene changes explicitly, then re-inspect the hierarchy or properties
  to verify the intended result.
- Check editor/game logs for errors and report which checks were run. If a
  tool is unavailable, state that validation limitation rather than claiming
  a check passed.

## Multi-agent coordination

- Keep each agent's edits within its assigned scope. Coordinate before
  concurrent edits to shared files.
- Integrate existing changes; never revert another contributor's work as
  cleanup.
- Report changed files, validation performed, and any remaining blockers.