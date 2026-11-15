# NASA Gale Crater Rover Simulation (3D Web Edition)

An interactive low-poly 3D Mars rover exploration and logistics game targeting web browsers, built with Godot 4.7+ using the WebGL2 (`gl_compatibility`) renderer.

The player pilots an exploration rover across Gale Crater topographic terrain, handles environmental variables (slope, traction, atmospheric dust, wind speed, battery health), extracts core rock samples, and inspects real NASA planetary data debriefs.

---

## Features & Gameplay

- **Gale Crater Topography**: High-resolution 3D terrain derived from ESA Mars Express HRSC orbital elevation data.
- **2 Playable Operations**:
  - **Operation 01: Yellowknife Bay**: Clear Martian skies (Tau 0.38), mudstone outcrop sample extraction (~65m).
  - **Operation 02: Bagnold Dunes (High Hazard)**: Severe atmospheric dust storm (Tau 2.45), dense ochre fog, high gale winds (~14–18 m/s), 20% emergency spawn battery, and distant basalt dune sample extraction (~206m).
- **Dual Rover Classes**:
  - **Heavy Surveyor (Curiosity/Perseverance Analog)**: Powered by Plutonium-238 MMRTG nuclear decay (100% storm immune, deliberate speed, heavy chassis).
  - **Agile Scout (Spirit/Opportunity Analog)**: Powered by photovoltaic solar arrays (fast and nimble, but power drain triples in dust storms).
- **Telemetry HUD**: Live speed, terrain slope degrees, relative elevation, NASA REMS atmospheric telemetry (wind speed, surface temperature, ambient pressure, optical depth Tau), battery health indicator, top-compass ribbon with dynamic chevron targeting, and centered `[E]` sample drill prompt.

---

## How to Run & Deploy the Web Build

The project comes pre-exported in the [`web_build/`](./web_build) folder:
- `index.html`, `index.js`, `index.wasm`, `index.pck`
- `vercel.json` (Pre-configured security isolation headers)
- `_headers` (Cloudflare Pages / Netlify configuration)

> **Important**: Modern web browsers do not allow WebAssembly (`.wasm`) or game packs (`.pck`) to load over raw `file://` URLs (double-clicking `index.html` directly will be blocked by browser CORS security). It must be served over an HTTP server.

---

### 1. Local Setup (Running on your Machine)

Use the included helper script [`serve_web.py`](./serve_web.py). It automatically attaches the required `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers and sets correct `.wasm` MIME types.

#### Using the Python Script:
1. Open a terminal or command prompt in the root of the project:
   ```bash
   python serve_web.py
   ```
2. Open your web browser (Chrome, Edge, Firefox) and navigate to:
   ```
   http://localhost:8080/index.html
   ```

#### Alternative Local Servers:
If you do not have Python installed, you can use:
- **Node.js**:
  ```bash
  npx serve web_build
  ```
- **VS Code**: Install the *Live Server* extension, right-click `web_build/index.html`, and choose **Open with Live Server**.

---

### 2. Deploying to Vercel (Recommended)

Vercel is the easiest deployment option because it supports custom HTTP response headers out of the box via `vercel.json`.

1. Install the Vercel CLI (or connect your GitHub repository to Vercel via [vercel.com](https://vercel.com)):
   ```bash
   npm install -g vercel
   ```
2. Navigate into the `web_build` directory (or point Vercel's root directory to `web_build`):
   ```bash
   cd web_build
   vercel
   ```
3. Follow the prompts. The included `vercel.json` ensures that `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` are sent with every asset, allowing the game to load immediately on any device without errors.

---

### 3. Deploying to GitHub Pages

GitHub Pages is free, but it does not permit setting custom server response headers. To run Godot 4 Web builds on GitHub Pages:

1. Copy the contents of [`web_build/`](./web_build) into the root (or `/docs` folder) of your GitHub repository.
2. Download the small helper script [`coi-serviceworker.js`](https://github.com/gzuidhof/coi-serviceworker/blob/master/coi-serviceworker.min.js) and place it alongside `index.html`.
3. Open `index.html` in an editor and add the script to the `<head>` tag:
   ```html
   <script src="coi-serviceworker.js"></script>
   ```
   *(This service worker injects the necessary security headers on the client side).*
4. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch** (e.g. `main` or `/docs`).
5. Save. Your game will be live at `https://<username>.github.io/<repo-name>/`.

---

## How to Re-export the Web Build from Source

If you make changes in Godot and want to update the `web_build` folder:

1. Ensure the Web Export Templates are installed in Godot (**Editor** → **Manage Export Templates...**).
2. Run headless export via terminal:
   ```bash
   "C:\NASA\Godot_v4.7.2-stable_win64.exe" --headless --path "." --export-release "Web" "web_build/index.html"
   ```
   *Or open Godot, click **Project** → **Export...** → **Export Project** into `web_build/index.html`.*

---

## Controls

| Action | Keybinding |
| --- | --- |
| **Throttle / Accelerate** | `W` or `Up Arrow` |
| **Reverse / Brake** | `S` or `Down Arrow` |
| **Steer Left** | `A` or `Left Arrow` |
| **Steer Right** | `D` or `Right Arrow` |
| **Drill / Collect Sample** | `E` (when inside sample zone) |
| **Pause / Operations Menu** | `ESC` |
| **Free Camera Look** | Mouse Drag / Orbit |

---

## Super Intelligence-Assisted Development

Super intelligence coding agents were used to support development of this project, including **Antigravity** and **GitHub Copilot**. They assisted with coding and development tasks; project decisions and final changes were reviewed by the developer.

---

## Resources Used

Checked against the project files and data citations:

| Resource | Description & Usage |
| --- | --- |
| **Gale Crater Topography** | Derived from ESA Mars Express High Resolution Stereo Camera (HRSC) data. Credits to K. Gwinner, J. Oberst, R. Jaumann, and G. Neukum. Topographic asset: [`assets/gale_crater.glb`](./assets/gale_crater.glb). |
| **Mars Rock Formations** | Low-poly 3D rock clusters and sample outcrop models by Ivan Vakulko, licensed under CC BY 4.0 ([`assets/mars_rocks.glb`](./assets/mars_rocks.glb)). |
| **NASA Planetary Data System (PDS)** | CheMin (X-ray Diffraction), ChemCam (LIBS), and APXS (Alpha Particle X-Ray Spectrometer) scientific data logs for Yellowknife Bay Mudstone and Bagnold Basalt Dunes referenced in science debriefs. |
| **NASA REMS (Rover Environmental Monitoring Station)** | Environmental telemetry baselines (atmospheric pressure ~812 Pa, diurnal temperature range -14°C to -72°C, optical depth Tau). |
| **NASA Perseverance / Curiosity Engineering Specifications** | Vehicle scale, MMRTG nuclear decay vs. photovoltaic solar power trade-offs, and mass-inertia clearance models. |
