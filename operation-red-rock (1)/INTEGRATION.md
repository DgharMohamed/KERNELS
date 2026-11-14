# Operation Red Rock — Mission Hub Integration Note

## Files Included
- `hubData.js`: All text copy, robot gameplay stats, workshop upgrades, missions, Codex science facts, achievements, credits, and save defaults.
- `hub.css`: Flat dark-space styles (`#0B1020`, `#141A2E`, `#E2572B`, `#5DCAA5`, `#8A90A2`), responsive desktop + mobile bottom navigation, and `prefers-reduced-motion` support.
- `hub.js`: Mission Hub controller, 3D Three.js rover preview (with SVG fallback), 2D starfield and mini-maps, `localStorage` persistence (`operationRedRock.v1`), keyboard navigation, and `window.Hub`.
- `index.html`: Contains the `<script type="importmap">`, the `<!-- MISSION HUB HTML FRAGMENT -->` block, and a standalone/demo harness at the bottom (replace the inline harness `<script type="module">` with your `game.js`).

## Integration Flow for Game Logic (`game.js`)

1. **Initialize on startup (`Hub.init`)**:
   ```js
   import Hub from './hub.js';

   Hub.init({
     onLaunch({ missionId, robotId }) {
       // Map missionId -> level/mode:
       // 'training1' -> Atacama Driving tutorial
       // 'training2' -> Atacama Battery Management tutorial
       // 'training3' -> Atacama Sample Retrieval tutorial
       // 'workshop'  -> Rover Upgrade Workshop screen/scene
       // 'redRock'   -> Gale Crater Mars mission
       startLevel(missionId, robotId);
     },
     onReplayIntro() {
       Hub.hide();
       playIntroCinematic(() => Hub.show('home'));
     },
     onSettingsChange(settings) {
       // settings = { music, sfx, quality, callsign }
       applyAudioAndQuality(settings);
     },
     onAudioUnlock() {
       unlockWebAudioContext();
     },
     onRestart() {
       restartCurrentMission();
     },
     onResume() {
       resumeGameLoop();
     },
     onBackToHub() {
       cleanupCurrentLevel();
       // Hub automatically calls Hub.show('missions') when Back to hub is clicked
     },
   });
   ```

2. **Report asset loading progress (`Hub.setProgress`)**:
   - Call `Hub.setProgress(0..100)` while loading terrain, rover assets, and audio.
   - `Launch` stays disabled until `Hub.setProgress(100)` is reached, which transitions from Loading to Home.

3. **Save & update player progress after each mission (`Hub.getPlayerData` / `Hub.setPlayerData`)**:
   - After a mission or workshop craft finishes, read the current state via `const data = Hub.getPlayerData()`, update `completedMissions`, `stars`, `bestScores`, `build`, `unlockedCodex`, and `achievements`, then pass it back with `Hub.setPlayerData(data)`.
   - Calling `Hub.setPlayerData(data)` persists to `localStorage` (`operationRedRock.v1`) and unlocks `redRock` automatically once `'training1'`, `'training2'`, and `'training3'` are all in `completedMissions`.
   - Then call `Hub.show('missions')` to return the player to Mission Control.

4. **Pause Menu during gameplay**:
   - When the player presses `Escape` during gameplay, pause your simulation and call `Hub.showPause()`.
   - When the player clicks `Resume` (or presses `Escape` again), the hub calls `Hub.hidePause()` and triggers `onResume()`.

5. **Test Mode (`?demo`)**:
   - Open `index.html?demo` to simulate a 3-second load, seed 2 completed training missions + 4 Codex entries + 2 achievements, and log all callbacks to the console. Press `R` to reset the demo data.
