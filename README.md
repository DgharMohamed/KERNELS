# Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars

An educational web app that helps people learn how to identify Earth locations that can serve as analogs for future Moon base sites and Mars missions. Interactive challenges let learners test their understanding, and a 3D rover game lets them play through mission simulations on a Mars map provided by NASA.

## Repository Structure

- **operation-red-rock/**: Main web application, mission hub, and simulation canvas (Vite, React 19, TypeScript, Three.js 3D engine, Canvas).
- **Ressources_Documentation.md**: Detailed scientific documentation of all NASA datasets, DEMs, satellite imagery, telemetry, and research literature.
- **Super_Intelligence_Tools_Documentation.md**: Super Intelligence tools used for programming assistance and audio/video generation.
- **Car-Sounds/**: Vehicle audio and engine startup sound assets.
- **Robot-Sounds/**: Rover mechanical movement and robotics sound assets.
- **Wind-Sounds/**: Ambient Martian wind and atmospheric sound assets.

## Installation Guide

Follow these steps to run the website locally on your computer.

### Prerequisites

- [Node.js](https://nodejs.org/) 20.19 or newer, or 22.12 or newer. npm is included with Node.js.
- [Git](https://git-scm.com/downloads), to download the project.

### 1. Download the project

Open a terminal and clone this repository:

```bash
git clone https://github.com/DgharMohamed/KERNELS.git
```

### 2. Open the website folder

In the terminal, change to the application folder. On Windows PowerShell:

```powershell
cd KERNELS\operation-red-rock
```

On macOS or Linux:

```bash
cd KERNELS/operation-red-rock
```

### 3. Install dependencies and start the website

Run these commands from the `operation-red-rock` folder:

```bash
npm install
npm run dev
```

When the server is ready, open [http://localhost:3000](http://localhost:3000) in your browser. Keep the terminal open while testing; press `Ctrl+C` there to stop the server.

If installation fails, check that your Node.js version meets the requirement above (`node --version`) and run `npm install` again from the `operation-red-rock` folder.

For complete project details, simulation mechanics, and NASA dataset references, see [operation-red-rock/README.md](./operation-red-rock/README.md).
