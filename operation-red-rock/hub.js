/**
 * hub.js
 * Operation Red Rock — Mission Hub UI controller, 3D rover preview, 2D canvases,
 * localStorage persistence, keyboard navigation, and the global window.Hub contract.
 */

import * as THREE from 'three';
import {
  ACHIEVEMENTS,
  CODEX_ENTRIES,
  CREDITS_DATA,
  DEMO_PLAYER_DATA,
  HUB_COPY,
  INTRO_VIDEO_SRC,
  LOADING_TIPS,
  MISSIONS,
  ROBOTS,
  STORAGE_KEY,
  WORKSHOP_UPGRADES,
  createDefaultPlayerData,
  createDefaultSettings,
} from './hubData.js';

// ============================================================================
// 1. DATA & CONSTANTS
// ============================================================================

const VALID_SCREENS = new Set(['loading', 'home', 'garage', 'missions', 'codex', 'settings']);
const VALID_QUALITIES = new Set(['Low', 'Medium', 'High']);
const VALID_UPGRADE_KEYS = ['wheels', 'scanner', 'battery', 'solar', 'dustCover', 'repairKits'];
const MAX_STARS = 150;

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

// Reusable 2D / math variables (zero per-frame allocations inside rAF)
const _starColors = ['#FFFFFF', '#D6DCEB', '#8A90A2'];

// ============================================================================
// 2. STATE
// ============================================================================

const state = {
  initialized: false,
  visible: true,
  pauseVisible: false,
  introPlaying: false,
  introWaitingForKey: false,
  introDoneCallback: null,
  screen: 'loading',
  progress: 0,
  tipIndex: 0,
  tipTimerId: 0,
  audioUnlocked: false,
  selectedRobotId: 'explorer',
  inspectedRobotId: 'explorer',
  selectedMissionId: 'training1',
  playerData: createDefaultPlayerData(),
  settings: createDefaultSettings(window.innerWidth <= 768),
  callbacks: {
    onLaunch: null,
    onReplayIntro: null,
    onSettingsChange: null,
    onAudioUnlock: null,
    onRestart: null,
    onResume: null,
    onBackToHub: null,
  },
  rafId: 0,
  lastFrameTime: 0,
};

// Cached DOM references (populated on init)
const dom = {};

// ============================================================================
// 3. SAVING & VALIDATION (localStorage)
// ============================================================================

function isPlainObject(val) {
  return Boolean(val) && typeof val === 'object' && !Array.isArray(val);
}

function sanitizeCallsign(raw) {
  if (typeof raw !== 'string') return 'ROVER01';
  const cleaned = raw.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  return cleaned.length > 0 ? cleaned : 'ROVER01';
}

function validatePlayerData(raw) {
  const defaults = createDefaultPlayerData();
  if (!isPlainObject(raw)) return defaults;

  const validMissionIds = new Set(MISSIONS.filter((m) => m.playable).map((m) => m.id));
  const validCodexIds = new Set(CODEX_ENTRIES.map((c) => c.id));
  const validAchievementIds = new Set(ACHIEVEMENTS.map((a) => a.id));

  const completedMissions = Array.isArray(raw.completedMissions)
    ? Array.from(new Set(raw.completedMissions.filter((id) => typeof id === 'string' && validMissionIds.has(id))))
    : [];

  const stars = {};
  if (isPlainObject(raw.stars)) {
    for (const [k, v] of Object.entries(raw.stars)) {
      if (validMissionIds.has(k) && typeof v === 'number' && Number.isFinite(v)) {
        stars[k] = Math.max(0, Math.min(3, Math.round(v)));
      }
    }
  }

  const bestScores = {};
  if (isPlainObject(raw.bestScores)) {
    for (const [k, v] of Object.entries(raw.bestScores)) {
      if (validMissionIds.has(k) && typeof v === 'number' && Number.isFinite(v) && v >= 0) {
        bestScores[k] = Math.round(v);
      }
    }
  }

  const build = { ...defaults.build };
  if (isPlainObject(raw.build)) {
    for (const key of VALID_UPGRADE_KEYS) {
      build[key] = Boolean(raw.build[key]);
    }
  }

  // Always include default-unlocked codex entries plus any unlocked via completed missions
  const unlockedSet = new Set(defaults.unlockedCodex);
  if (Array.isArray(raw.unlockedCodex)) {
    for (const id of raw.unlockedCodex) {
      if (typeof id === 'string' && validCodexIds.has(id)) {
        unlockedSet.add(id);
      }
    }
  }
  for (const entry of CODEX_ENTRIES) {
    if (entry.defaultUnlocked || (entry.unlockMission && completedMissions.includes(entry.unlockMission))) {
      unlockedSet.add(entry.id);
    }
  }

  const achievements = Array.isArray(raw.achievements)
    ? Array.from(new Set(raw.achievements.filter((id) => typeof id === 'string' && validAchievementIds.has(id))))
    : [];

  return {
    completedMissions,
    stars,
    bestScores,
    build,
    unlockedCodex: Array.from(unlockedSet),
    achievements,
  };
}

function validateSettings(raw) {
  const defaults = createDefaultSettings(window.innerWidth <= 768);
  if (!isPlainObject(raw)) return defaults;

  return {
    music: typeof raw.music === 'boolean' ? raw.music : defaults.music,
    sfx: typeof raw.sfx === 'boolean' ? raw.sfx : defaults.sfx,
    quality: typeof raw.quality === 'string' && VALID_QUALITIES.has(raw.quality) ? raw.quality : defaults.quality,
    callsign: typeof raw.callsign === 'string' ? sanitizeCallsign(raw.callsign) : defaults.callsign,
  };
}

function loadFromStorage() {
  try {
    const rawText = window.localStorage.getItem(STORAGE_KEY);
    if (!rawText) return;
    const parsed = JSON.parse(rawText);
    if (!isPlainObject(parsed)) {
      throw new Error('Invalid storage root');
    }
    state.playerData = validatePlayerData(parsed.playerData);
    state.settings = validateSettings(parsed.settings);

    if (typeof parsed.selectedRobotId === 'string') {
      const robot = ROBOTS.find((r) => r.id === parsed.selectedRobotId && !r.locked);
      if (robot) {
        state.selectedRobotId = robot.id;
        state.inspectedRobotId = robot.id;
      }
    }
  } catch {
    // Corrupted JSON or disabled storage: silently reset to clean defaults
    state.playerData = createDefaultPlayerData();
    state.settings = createDefaultSettings(window.innerWidth <= 768);
    state.selectedRobotId = 'explorer';
    state.inspectedRobotId = 'explorer';
    saveToStorage();
  }
}

function saveToStorage() {
  try {
    const payload = {
      version: 1,
      selectedRobotId: state.selectedRobotId,
      playerData: state.playerData,
      settings: state.settings,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage disabled or quota exceeded; continue running in memory
  }
}

function clonePlayerData(data) {
  return {
    completedMissions: [...data.completedMissions],
    stars: { ...data.stars },
    bestScores: { ...data.bestScores },
    build: { ...data.build },
    unlockedCodex: [...data.unlockedCodex],
    achievements: [...data.achievements],
  };
}

// ============================================================================
// 4. SVG ICONS (Inline Flat SVGs, zero emoji)
// ============================================================================

function svgIcon(name, size = 18) {
  const s = size;
  const common = `width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"`;
  switch (name) {
    case 'star-filled':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="#E2572B" stroke="#E2572B" stroke-width="1.5" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    case 'star-empty':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#3A466B" stroke-width="1.5" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    case 'lock':
      return `<svg ${common}><rect x="5" y="11" width="14" height="10"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;
    case 'check':
      return `<svg ${common}><polyline points="20 6 9 17 4 12"/></svg>`;
    case 'wheels':
      return `<svg ${common}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`;
    case 'scanner':
      return `<svg ${common}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`;
    case 'battery':
      return `<svg ${common}><rect x="2" y="7" width="17" height="10"/><line x1="22" y1="10" x2="22" y2="14"/><line x1="7" y1="10" x2="7" y2="14"/><line x1="12" y1="10" x2="12" y2="14"/></svg>`;
    case 'solar':
      return `<svg ${common}><rect x="3" y="5" width="18" height="12"/><line x1="3" y1="11" x2="21" y2="11"/><line x1="9" y1="5" x2="9" y2="17"/><line x1="15" y1="5" x2="15" y2="17"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
    case 'dustCover':
      return `<svg ${common}><path d="M12 3l8 4v6c0 4.5-3.4 7.5-8 9-4.6-1.5-8-4.5-8-9V7l8-4z"/></svg>`;
    case 'repairKits':
      return `<svg ${common}><rect x="3" y="6" width="18" height="14"/><path d="M9 6V4h6v2"/><line x1="12" y1="10" x2="12" y2="16"/><line x1="9" y1="13" x2="15" y2="13"/></svg>`;
    case 'wheel':
      return `<svg ${common}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/></svg>`;
    case 'rocket':
      return `<svg ${common}><path d="M12 2c3 3 5 7 5 11l-5 4-5-4c0-4 2-8 5-11z"/><line x1="9" y1="19" x2="15" y2="19"/></svg>`;
    case 'bolt':
      return `<svg ${common}><polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2"/></svg>`;
    case 'shield':
      return `<svg ${common}><path d="M12 3l7 3v6c0 4.2-3 7.5-7 9-4-1.5-7-4.8-7-9V6l7-3z"/><polyline points="9 12 11 14 15 10"/></svg>`;
    default:
      return '';
  }
}

function renderSvgRoverFallback(container, robot) {
  if (!container) return;
  const bodyHex = '#' + robot.palette.body.toString(16).padStart(6, '0');
  const accentHex = '#' + robot.palette.accent.toString(16).padStart(6, '0');
  container.innerHTML = `
    <svg width="220" height="220" viewBox="0 0 220 220" fill="none" aria-hidden="true">
      <rect x="36" y="164" width="148" height="4" fill="#26304D"/>
      <line x1="65" y1="120" x2="54" y2="146" stroke="#8A90A2" stroke-width="4"/>
      <line x1="110" y1="120" x2="110" y2="146" stroke="#8A90A2" stroke-width="4"/>
      <line x1="155" y1="120" x2="166" y2="146" stroke="#8A90A2" stroke-width="4"/>
      <rect x="64" y="88" width="92" height="34" fill="${bodyHex}" stroke="#FFFFFF" stroke-width="2"/>
      <rect x="54" y="80" width="112" height="10" fill="#1D3566" stroke="#8A90A2" stroke-width="1.5"/>
      <rect x="132" y="50" width="8" height="30" fill="#8A90A2"/>
      <rect x="122" y="38" width="28" height="14" fill="#263047" stroke="#FFFFFF" stroke-width="1.5"/>
      <circle cx="131" cy="45" r="3" fill="${accentHex}"/>
      <circle cx="141" cy="45" r="3" fill="#5DCAA5"/>
      <circle cx="54" cy="148" r="14" fill="#141A2E" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="110" cy="148" r="14" fill="#141A2E" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="166" cy="148" r="14" fill="#141A2E" stroke="#FFFFFF" stroke-width="3"/>
    </svg>
  `;
}

// ============================================================================
// 5. AUDIO UNLOCK & CALLBACKS
// ============================================================================

function triggerAudioUnlock() {
  if (state.audioUnlocked) return;
  state.audioUnlocked = true;
  if (typeof state.callbacks.onAudioUnlock === 'function') {
    state.callbacks.onAudioUnlock();
  }
}

function emitSettingsChange() {
  if (typeof state.callbacks.onSettingsChange === 'function') {
    state.callbacks.onSettingsChange({ ...state.settings });
  }
}

function launchMission(missionId) {
  if (state.progress < 100) return;
  if (getMissionStatus(missionId) === 'locked') return;
  const robotId = state.selectedRobotId;
  playIntroVideo(() => {
    if (typeof state.callbacks.onLaunch === 'function') {
      state.callbacks.onLaunch({ missionId, robotId });
    }
  });
}

function updateIntroMuteButton() {
  if (!dom.introMuteBtn || !dom.introVideo) return;
  dom.introMuteBtn.textContent = dom.introVideo.muted
    ? HUB_COPY.intro.unmuteLabel
    : HUB_COPY.intro.muteLabel;
}

function playIntroVideo(onComplete) {
  const overlay = dom.introOverlay;
  const video = dom.introVideo;
  if (!overlay || !video) {
    hideHub();
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  hideHub();
  state.introPlaying = true;
  state.introWaitingForKey = false;
  state.introDoneCallback = typeof onComplete === 'function' ? onComplete : null;

  if (dom.introControls) {
    dom.introControls.hidden = false;
  }

  video.src = INTRO_VIDEO_SRC;
  video.currentTime = 0;
  video.muted = !state.settings.music && !state.settings.sfx;
  updateIntroMuteButton();
  overlay.hidden = false;
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }

  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {
      // Fallback to muted autoplay if browser blocks audio
      video.muted = true;
      updateIntroMuteButton();
      const mutedPromise = video.play();
      if (mutedPromise && typeof mutedPromise.catch === 'function') {
        mutedPromise.catch(() => finishIntroVideo());
      }
    });
  }
}

function handleIntroEnded() {
  if (!state.introPlaying || state.introWaitingForKey) return;
  state.introWaitingForKey = true;
  if (dom.introVideo) {
    dom.introVideo.pause();
  }
  if (dom.introControls) {
    dom.introControls.hidden = true;
  }
}

function finishIntroVideo() {
  if (!state.introPlaying) return;
  state.introPlaying = false;
  state.introWaitingForKey = false;

  if (dom.introControls) {
    dom.introControls.hidden = false;
  }
  if (dom.introVideo) {
    dom.introVideo.pause();
    dom.introVideo.removeAttribute('src');
    dom.introVideo.load();
  }
  if (dom.introOverlay) {
    dom.introOverlay.hidden = true;
  }

  const cb = state.introDoneCallback;
  state.introDoneCallback = null;
  if (typeof cb === 'function') cb();
}

// ============================================================================
// 6. MISSION & PROGRESS HELPERS
// ============================================================================

function getMissionStatus(missionId) {
  const mission = MISSIONS.find((m) => m.id === missionId);
  if (!mission || mission.lockedAlways || !mission.playable) return 'locked';
  if (state.playerData.completedMissions.includes(missionId)) return 'completed';
  const reqMet = mission.requires.every((reqId) => state.playerData.completedMissions.includes(reqId));
  if (!reqMet) return 'locked';
  if (mission.minStars) {
    for (const [reqId, neededStars] of Object.entries(mission.minStars)) {
      if ((state.playerData.stars[reqId] || 0) < neededStars) return 'locked';
    }
  }
  return 'available';
}

function getRecommendedMission() {
  const playable = MISSIONS.filter((m) => m.playable && m.isMission && !m.lockedAlways);
  for (const m of playable) {
    const status = getMissionStatus(m.id);
    if (status === 'available') return m;
  }
  return playable[playable.length - 1] || MISSIONS[0];
}

// ============================================================================
// 7. NAVIGATION & ACCESSIBILITY
// ============================================================================

function showScreen(screenName) {
  const target = VALID_SCREENS.has(screenName) ? screenName : 'home';
  state.screen = target;
  if (dom.root) {
    dom.root.setAttribute('data-screen', target);
  }

  // Hide top/bottom navigation during loading screen
  if (dom.navBar) {
    dom.navBar.hidden = target === 'loading';
  }

  // Update screen visibility and active fade class
  for (const el of dom.screens) {
    const name = el.getAttribute('data-screen-name');
    const isMatch = name === target;
    el.hidden = !isMatch;
    if (isMatch) {
      // Force layout frame so CSS opacity transition triggers smoothly when not reduced motion
      el.classList.remove('is-active');
      void el.offsetWidth;
      el.classList.add('is-active');
    } else {
      el.classList.remove('is-active');
    }
  }

  // Update tab selection state
  for (const tab of dom.tabs) {
    const isSelected = tab.getAttribute('data-screen-target') === target;
    tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    tab.setAttribute('tabindex', isSelected ? '0' : '-1');
  }

  // Reparent the shared 3D robot viewport into Home or Garage slot
  mountRobotViewportForScreen(target);

  // Render active screen data
  renderActiveScreen();
  syncLoopState();
}

function showHub(screenName) {
  state.visible = true;
  if (dom.root) {
    dom.root.hidden = false;
    dom.root.setAttribute('data-hub-visible', 'true');
  }
  if (screenName) {
    showScreen(screenName);
  } else {
    mountRobotViewportForScreen(state.screen);
    renderActiveScreen();
    syncLoopState();
  }
}

function hideHub() {
  state.visible = false;
  if (dom.root) {
    dom.root.hidden = true;
    dom.root.setAttribute('data-hub-visible', 'false');
  }
  closeAllModals();
  stopLoop();
}

function closeAllModals() {
  if (dom.creditsModal) dom.creditsModal.hidden = true;
  if (dom.resetModal) dom.resetModal.hidden = true;
}

function handleGlobalKeydown(event) {
  triggerAudioUnlock();

  if (state.introPlaying) {
    const isAtEnd = state.introWaitingForKey || (dom.introVideo && dom.introVideo.ended);
    if (isAtEnd) {
      event.preventDefault();
      finishIntroVideo();
      return;
    }
    // While video is playing: ignore all keyboard keys completely
    event.preventDefault();
    return;
  }

  if (event.key === 'Escape') {
    if (state.pauseVisible) {
      event.preventDefault();
      hidePause();
      if (typeof state.callbacks.onResume === 'function') {
        state.callbacks.onResume();
      }
      return;
    }
    if (dom.creditsModal && !dom.creditsModal.hidden) {
      event.preventDefault();
      dom.creditsModal.hidden = true;
      if (dom.creditsBtn) dom.creditsBtn.focus();
      return;
    }
    if (dom.resetModal && !dom.resetModal.hidden) {
      event.preventDefault();
      dom.resetModal.hidden = true;
      if (dom.resetBtn) dom.resetBtn.focus();
    }
  }
}

function setupTabKeyboardNavigation() {
  const tabList = dom.tabs;
  tabList.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-screen-target');
      if (target) showScreen(target);
    });
    tab.addEventListener('keydown', (e) => {
      let nextIdx = -1;
      if (e.key === 'ArrowRight') nextIdx = (index + 1) % tabList.length;
      else if (e.key === 'ArrowLeft') nextIdx = (index - 1 + tabList.length) % tabList.length;
      else if (e.key === 'Home') nextIdx = 0;
      else if (e.key === 'End') nextIdx = tabList.length - 1;
      if (nextIdx >= 0) {
        e.preventDefault();
        const nextTab = tabList[nextIdx];
        const target = nextTab.getAttribute('data-screen-target');
        if (target) showScreen(target);
        nextTab.focus();
      }
    });
  });
}

// ============================================================================
// 8. SCREEN: LOADING
// ============================================================================

function startLoadingTips() {
  stopLoadingTips();
  if (dom.loadingTip) {
    dom.loadingTip.textContent = LOADING_TIPS[state.tipIndex % LOADING_TIPS.length];
  }
  state.tipTimerId = window.setInterval(() => {
    if (state.screen !== 'loading' || !state.visible) return;
    state.tipIndex = (state.tipIndex + 1) % LOADING_TIPS.length;
    if (dom.loadingTip) {
      dom.loadingTip.textContent = LOADING_TIPS[state.tipIndex];
    }
  }, 3500);
}

function stopLoadingTips() {
  if (state.tipTimerId) {
    window.clearInterval(state.tipTimerId);
    state.tipTimerId = 0;
  }
}

function setProgress(value) {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  const clamped = Math.max(0, Math.min(100, Math.round(numeric)));
  const wasComplete = state.progress >= 100;
  state.progress = clamped;

  if (dom.loadingPercent) dom.loadingPercent.textContent = `${clamped}%`;
  if (dom.loadingBarFill) dom.loadingBarFill.style.width = `${clamped}%`;
  if (dom.loadingBarTrack) dom.loadingBarTrack.setAttribute('aria-valuenow', String(clamped));
  if (dom.loadingStatus) {
    dom.loadingStatus.textContent = clamped >= 100 ? HUB_COPY.loadingReadyText : HUB_COPY.loadingStatusText;
  }
  if (dom.loadingEnterBtn) {
    dom.loadingEnterBtn.disabled = clamped < 100;
  }

  updateHomeLaunchAvailability();

  // When loading reaches 100 for the first time while on the loading screen, transition to Home
  if (!wasComplete && clamped >= 100 && state.screen === 'loading') {
    window.setTimeout(() => {
      if (state.screen === 'loading' && state.progress >= 100) {
        showScreen('home');
      }
    }, reducedMotionQuery.matches ? 0 : 220);
  }
}

// ============================================================================
// 9. SCREEN: HOME & STARFIELD (2D Canvas, max 150 stars, flat dots)
// ============================================================================

const starfield = {
  initialized: false,
  width: 0,
  height: 0,
  count: MAX_STARS,
  x: new Float32Array(MAX_STARS),
  y: new Float32Array(MAX_STARS),
  speed: new Float32Array(MAX_STARS),
  size: new Float32Array(MAX_STARS),
  colorIdx: new Uint8Array(MAX_STARS),
};

function initStarfield() {
  if (!dom.starfield) return;
  resizeStarfield();
  for (let i = 0; i < starfield.count; i++) {
    starfield.x[i] = Math.random() * starfield.width;
    starfield.y[i] = Math.random() * starfield.height;
    starfield.speed[i] = 6 + Math.random() * 14;
    starfield.size[i] = i % 5 === 0 ? 2 : 1.25;
    starfield.colorIdx[i] = i % 3;
  }
  starfield.initialized = true;
  drawStarfield(0);
}

function resizeStarfield() {
  if (!dom.starfield) return;
  const w = Math.max(320, window.innerWidth);
  const h = Math.max(320, window.innerHeight);
  if (starfield.width === w && starfield.height === h) return;
  starfield.width = w;
  starfield.height = h;
  dom.starfield.width = w;
  dom.starfield.height = h;
}

function drawStarfield(dt) {
  if (!dom.starfield || !starfield.initialized) return;
  const ctx = dom.starfield.getContext('2d');
  if (!ctx) return;

  const w = starfield.width;
  const h = starfield.height;
  ctx.fillStyle = '#0B1020';
  ctx.fillRect(0, 0, w, h);

  const animateStars = dt > 0 && !reducedMotionQuery.matches;
  for (let i = 0; i < starfield.count; i++) {
    if (animateStars) {
      starfield.y[i] += starfield.speed[i] * dt;
      if (starfield.y[i] > h) {
        starfield.y[i] = 0;
        starfield.x[i] = (starfield.x[i] + 73) % w;
      }
    }
    ctx.fillStyle = _starColors[starfield.colorIdx[i]];
    const sz = starfield.size[i];
    ctx.fillRect(starfield.x[i], starfield.y[i], sz, sz);
  }
}

function updateHomeLaunchAvailability() {
  const ready = state.progress >= 100;
  if (dom.launchBtn) {
    dom.launchBtn.disabled = !ready;
  }
  if (dom.homeLaunchHint) {
    dom.homeLaunchHint.hidden = ready;
    dom.homeLaunchHint.textContent = HUB_COPY.home.launchLockedHint;
  }
}

function renderHomeScreen() {
  const robot = ROBOTS.find((r) => r.id === state.selectedRobotId) || ROBOTS[1];
  const recommended = getRecommendedMission();
  const playableMissions = MISSIONS.filter((m) => m.playable && m.isMission && !m.lockedAlways);
  const completedCount = state.playerData.completedMissions.filter((id) =>
    playableMissions.some((m) => m.id === id)
  ).length;
  const totalStars = playableMissions.reduce((sum, m) => sum + (state.playerData.stars[m.id] || 0), 0);

  if (dom.navCallsignValue) dom.navCallsignValue.textContent = state.settings.callsign;
  if (dom.homeCallsign) dom.homeCallsign.textContent = state.settings.callsign;
  if (dom.homeRover) dom.homeRover.textContent = robot.name;
  if (dom.homeProgress) {
    dom.homeProgress.textContent = `${completedCount} / ${playableMissions.length} Missions · ${totalStars} / ${playableMissions.length * 3} Stars`;
  }
  if (dom.homeNextText) dom.homeNextText.textContent = `${HUB_COPY.home.nextLabel}: ${recommended.shortTitle}`;
  if (dom.homeNextLocation) dom.homeNextLocation.textContent = recommended.location;

  updateHomeLaunchAvailability();
  if (reducedMotionQuery.matches) {
    drawStarfield(0);
  }
}

// ============================================================================
// 10. SCREEN: GARAGE
// ============================================================================

function renderGarageScreen() {
  const inspected = ROBOTS.find((r) => r.id === state.inspectedRobotId) || ROBOTS[1];
  if (dom.garageSelectedName) dom.garageSelectedName.textContent = inspected.name;
  if (dom.garageSelectedRole) {
    dom.garageSelectedRole.textContent = inspected.locked
      ? `${inspected.role} · ${inspected.lockReason}`
      : inspected.role;
  }

  if (dom.robotCards) {
    dom.robotCards.innerHTML = ROBOTS.map((robot) => {
      const isSelected = robot.id === state.selectedRobotId;
      const isInspected = robot.id === state.inspectedRobotId;
      const stateLabel = robot.locked
        ? robot.lockReason
        : isSelected
          ? HUB_COPY.garage.selectedText
          : HUB_COPY.garage.availableText;

      const statRows = Object.entries(HUB_COPY.garage.statLabels)
        .map(([key, label]) => {
          const val = robot.stats[key] || 0;
          let bars = '';
          for (let i = 1; i <= 5; i++) {
            bars += `<span class="hub-stat-seg ${i <= val ? 'is-filled' : ''}"></span>`;
          }
          return `
            <div class="hub-stat-row">
              <div class="hub-stat-top">
                <span>${label}</span>
                <span class="hub-mono-value">${val}/5</span>
              </div>
              <div class="hub-stat-bars" aria-label="${label} ${val} out of 5">${bars}</div>
            </div>
          `;
        })
        .join('');

      return `
        <button
          type="button"
          class="hub-robot-card ${isSelected || isInspected ? 'is-selected' : ''} ${robot.locked ? 'is-locked' : ''}"
          role="option"
          aria-selected="${isSelected ? 'true' : 'false'}"
          data-robot-id="${robot.id}"
        >
          <div class="hub-robot-card-head">
            <span class="hub-robot-name">${robot.name}</span>
            <span class="hub-robot-state">${stateLabel}</span>
          </div>
          <p class="hub-robot-role">${robot.role}</p>
          <p class="hub-robot-desc">${robot.description}</p>
          <div class="hub-stat-list">${statRows}</div>
        </button>
      `;
    }).join('');

    const cards = Array.from(dom.robotCards.querySelectorAll('.hub-robot-card'));
    cards.forEach((card, idx) => {
      card.addEventListener('click', () => selectRobotCard(card.getAttribute('data-robot-id')));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = cards[(idx + 1) % cards.length];
          next.focus();
          selectRobotCard(next.getAttribute('data-robot-id'));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = cards[(idx - 1 + cards.length) % cards.length];
          prev.focus();
          selectRobotCard(prev.getAttribute('data-robot-id'));
        }
      });
    });
  }

  if (dom.upgradesGrid) {
    dom.upgradesGrid.innerHTML = WORKSHOP_UPGRADES.map((upg) => {
      const owned = Boolean(state.playerData.build[upg.id]);
      return `
        <div class="hub-upgrade-item ${owned ? 'is-owned' : ''}" title="${upg.hint}">
          <div class="hub-upgrade-icon">${svgIcon(upg.id, 20)}</div>
          <div class="hub-upgrade-name">${upg.name}</div>
          <div class="hub-upgrade-status">${owned ? HUB_COPY.garage.ownedText : HUB_COPY.garage.unownedText}</div>
        </div>
      `;
    }).join('');
  }
}

function selectRobotCard(robotId) {
  const robot = ROBOTS.find((r) => r.id === robotId);
  if (!robot) return;

  state.inspectedRobotId = robot.id;
  setPreviewRobot(robot);
  nudgePreviewSpin();

  if (robot.locked) {
    if (dom.garageFeedback) {
      dom.garageFeedback.textContent = `${robot.name} is coming soon. ${getRobotName(state.selectedRobotId)} remains equipped for missions.`;
    }
  } else {
    state.selectedRobotId = robot.id;
    saveToStorage();
    if (dom.garageFeedback) {
      dom.garageFeedback.textContent = `${robot.name} equipped for launch.`;
    }
  }

  renderGarageScreen();
}

function getRobotName(id) {
  const r = ROBOTS.find((item) => item.id === id);
  return r ? r.name : 'Explorer';
}

// ============================================================================
// 11. SCREEN: MISSIONS & MINI-MAP (2D Canvas flat shapes)
// ============================================================================

function renderStarsMarkup(starCount) {
  let html = '';
  for (let i = 1; i <= 3; i++) {
    html += svgIcon(i <= starCount ? 'star-filled' : 'star-empty', 15);
  }
  return html;
}

function renderMissionsScreen() {
  if (!MISSIONS.some((m) => m.id === state.selectedMissionId)) {
    state.selectedMissionId = MISSIONS[0].id;
  }

  if (dom.missionList) {
    dom.missionList.innerHTML = MISSIONS.map((mission) => {
      const status = getMissionStatus(mission.id);
      const isSelected = mission.id === state.selectedMissionId;
      const starCount = state.playerData.stars[mission.id] || 0;
      const best = state.playerData.bestScores[mission.id];
      const statusText = HUB_COPY.missions.statusLabels[status];
      const scoreText = typeof best === 'number' ? `Best: ${best}` : 'Best: —';

      return `
        <button
          type="button"
          class="hub-mission-row ${isSelected ? 'is-selected' : ''} ${status === 'locked' ? 'is-locked' : ''}"
          role="option"
          aria-selected="${isSelected ? 'true' : 'false'}"
          data-mission-id="${mission.id}"
        >
          <div class="hub-mission-row-left">
            <span class="hub-mission-row-title">${mission.title}</span>
            <span class="hub-mission-row-meta">
              <span>${mission.location}</span>
              <span aria-hidden="true">·</span>
              <span class="hub-status-text-${status}">${statusText}</span>
            </span>
          </div>
          <div class="hub-mission-row-right">
            ${mission.isMission ? `<span class="hub-stars-inline" aria-label="${starCount} of 3 stars">${renderStarsMarkup(starCount)}</span>` : ''}
            <span class="hub-muted-text hub-mono-value">${mission.isMission ? scoreText : 'Pre-launch'}</span>
          </div>
        </button>
      `;
    }).join('');

    const rows = Array.from(dom.missionList.querySelectorAll('.hub-mission-row'));
    rows.forEach((row, idx) => {
      row.addEventListener('click', () => {
        state.selectedMissionId = row.getAttribute('data-mission-id');
        renderMissionsScreen();
      });
      row.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = rows[(idx + 1) % rows.length];
          state.selectedMissionId = next.getAttribute('data-mission-id');
          renderMissionsScreen();
          dom.missionList.querySelector(`[data-mission-id="${state.selectedMissionId}"]`)?.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = rows[(idx - 1 + rows.length) % rows.length];
          state.selectedMissionId = prev.getAttribute('data-mission-id');
          renderMissionsScreen();
          dom.missionList.querySelector(`[data-mission-id="${state.selectedMissionId}"]`)?.focus();
        }
      });
    });
  }

  renderMissionDetail();
}

function renderMissionDetail() {
  const mission = MISSIONS.find((m) => m.id === state.selectedMissionId) || MISSIONS[0];
  const status = getMissionStatus(mission.id);
  const starCount = state.playerData.stars[mission.id] || 0;
  const best = state.playerData.bestScores[mission.id];

  if (dom.detailLocation) {
    dom.detailLocation.textContent = mission.skill
      ? `${mission.location} · ${mission.skill}`
      : mission.location;
  }
  if (dom.detailTitle) dom.detailTitle.textContent = mission.title;
  if (dom.detailBriefingLabel) {
    dom.detailBriefingLabel.textContent = mission.briefingLabel || 'Briefing';
  }
  if (dom.detailDescription) dom.detailDescription.textContent = mission.description;

  if (dom.detailStatus) {
    const icon = status === 'completed' ? svgIcon('check', 16) : status === 'locked' ? svgIcon('lock', 16) : '';
    dom.detailStatus.className = `hub-detail-status hub-status-text-${status}`;
    dom.detailStatus.innerHTML = `${icon}<span>${HUB_COPY.missions.statusLabels[status]}</span>`;
  }

  if (dom.detailMetrics) {
    dom.detailMetrics.hidden = !mission.isMission;
  }
  if (dom.detailStars) {
    dom.detailStars.innerHTML = mission.isMission ? renderStarsMarkup(starCount) : '<span class="hub-muted-text">—</span>';
  }
  if (dom.detailScore) {
    dom.detailScore.textContent = typeof best === 'number' ? String(best) : '—';
  }

  if (dom.detailObjectives) {
    dom.detailObjectives.innerHTML = mission.objectives.map((obj) => `<li>${obj}</li>`).join('');
  }

  if (dom.detailExtra) {
    if (mission.id === 'workshop') {
      const upgradesMarkup = WORKSHOP_UPGRADES.map((upg) => {
        const owned = Boolean(state.playerData.build[upg.id]);
        const costText = upg.cost === 1 ? '1 part' : `${upg.cost} parts`;
        return `
          <div class="hub-workshop-cost-row ${owned ? 'is-owned' : ''}">
            <span>${upg.name}</span>
            <span class="hub-workshop-cost-parts">${owned ? 'Equipped' : costText}</span>
          </div>
        `;
      }).join('');
      dom.detailExtra.innerHTML = `
        <div class="hub-detail-spec-box is-full">
          <span class="hub-muted-label">Upgrade Catalog (Parts Cost)</span>
          <div class="hub-workshop-cost-list">${upgradesMarkup}</div>
        </div>
      `;
    } else {
      const blocks = [];
      if (mission.challenges && mission.challenges.length > 0) {
        const items = mission.challenges.map((c) => `<li>${c}</li>`).join('');
        blocks.push(`
          <div class="hub-detail-spec-box is-full">
            <span class="hub-muted-label">Challenges</span>
            <ul class="hub-challenges-list">${items}</ul>
          </div>
        `);
      }
      if (mission.winLose) {
        blocks.push(`
          <div class="hub-detail-spec-box">
            <span class="hub-muted-label">Win / Lose</span>
            <p class="hub-detail-spec-text">${mission.winLose}</p>
          </div>
        `);
      }
      if (mission.scoring) {
        blocks.push(`
          <div class="hub-detail-spec-box">
            <span class="hub-muted-label">Score</span>
            <p class="hub-detail-spec-text">${mission.scoring}</p>
          </div>
        `);
      }
      if (mission.reward) {
        blocks.push(`
          <div class="hub-detail-spec-box is-full">
            <span class="hub-muted-label">Reward</span>
            <p class="hub-detail-spec-text">${mission.reward}</p>
          </div>
        `);
      }
      dom.detailExtra.innerHTML = blocks.length > 0
        ? `<div class="hub-detail-spec-grid">${blocks.join('')}</div>`
        : '';
    }
  }

  if (dom.detailLockReason) {
    if (status === 'locked') {
      dom.detailLockReason.hidden = false;
      dom.detailLockReason.textContent = mission.unlockText
        || (mission.id === 'redRock' ? HUB_COPY.missions.redRockUnlockRule : 'Complete previous requirements to unlock.');
    } else {
      dom.detailLockReason.hidden = true;
    }
  }

  if (dom.missionStartBtn) {
    const canStart = status !== 'locked' && state.progress >= 100;
    dom.missionStartBtn.disabled = !canStart;
    dom.missionStartBtn.textContent = status === 'locked' ? HUB_COPY.missions.lockedButton : HUB_COPY.missions.startButton;
  }

  drawMissionMiniMap(mission, status);
}

const mapImageCache = new Map();

function getMissionMapImage(src, onLoadRedraw) {
  if (!src) return null;
  let entry = mapImageCache.get(src);
  if (!entry) {
    const img = new Image();
    entry = { img, loaded: false, failed: false };
    img.onload = () => {
      entry.loaded = true;
      if (typeof onLoadRedraw === 'function') onLoadRedraw();
    };
    img.onerror = () => {
      entry.failed = true;
    };
    img.src = src;
    mapImageCache.set(src, entry);
  }
  return entry;
}

function drawCoverImage(ctx, img, w, h) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = w / h;
  let drawW = w;
  let drawH = h;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > canvasRatio) {
    drawH = h;
    drawW = h * imgRatio;
    offsetX = (w - drawW) / 2;
  } else {
    drawW = w;
    drawH = w / imgRatio;
    offsetY = (h - drawH) / 2;
  }
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

function drawMissionMiniMap(mission, status) {
  const canvas = dom.minimap;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // Base fallback fill
  ctx.fillStyle = '#0B1020';
  ctx.fillRect(0, 0, w, h);

  // Draw Mars orbital imagery when loaded (auto-repaints on load)
  const mapEntry = getMissionMapImage(mission.mapImage, () => {
    if (state.screen === 'missions' && state.selectedMissionId === mission.id) {
      drawMissionMiniMap(mission, getMissionStatus(mission.id));
    }
  });

  if (mapEntry && mapEntry.loaded && !mapEntry.failed) {
    drawCoverImage(ctx, mapEntry.img, w, h);
    // Subtle dark scrim for tactical route readability
    ctx.fillStyle = status === 'locked' ? 'rgba(11, 16, 32, 0.45)' : 'rgba(11, 16, 32, 0.25)';
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = '#261718';
    ctx.fillRect(0, 0, w, h);
  }

  // Subtle tactical coordinate grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1;
  for (let gx = 44; gx < w; gx += 44) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
    ctx.stroke();
  }
  for (let gy = 36; gy < h; gy += 36) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }

  // Alternate risky shortcut vs safe route for Mission 1 and Mission 4
  if (mission.mapStyle === 'atacama-drive' || mission.mapStyle === 'gale-crater') {
    ctx.save();
    ctx.strokeStyle = '#E2572B';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    if (mission.mapStyle === 'atacama-drive') {
      ctx.moveTo(62, 126);
      ctx.lineTo(210, 114);
      ctx.lineTo(368, 72);
    } else {
      ctx.moveTo(74, 124);
      ctx.lineTo(222, 112);
      ctx.lineTo(356, 76);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Primary tactical route
  if (mission.mapStyle === 'workshop-bay') {
    // Landing ellipse & drop zone target over Gale Crater
    ctx.strokeStyle = '#5DCAA5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(220, 86, 86, 36, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#E2572B';
    ctx.beginPath();
    ctx.arc(220, 86, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const routePoints = mission.mapStyle === 'atacama-battery'
      ? [[58, 122], [218, 76], [374, 68], [220, 112], [68, 128]]
      : mission.mapStyle === 'atacama-sample'
        ? [[62, 126], [164, 96], [274, 64], [362, 88]]
        : mission.mapStyle === 'water-trace'
          ? [[58, 118], [168, 92], [276, 66], [374, 108]]
          : mission.mapStyle === 'gale-crater' || mission.mapStyle === 'storm-run'
            ? [[74, 124], [148, 72], [248, 56], [356, 76]]
            : [[62, 126], [146, 72], [268, 56], [368, 72]];

    ctx.save();
    ctx.strokeStyle = status === 'locked' ? '#D6DCEB' : '#5DCAA5';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    routePoints.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.restore();

    // Waypoint / start / target markers
    routePoints.forEach(([px, py], idx) => {
      const isStart = idx === 0;
      const isEnd = idx === routePoints.length - 1;
      ctx.fillStyle = isStart ? '#FFFFFF' : isEnd ? '#E2572B' : '#5DCAA5';
      ctx.strokeStyle = '#0B1020';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, isStart || isEnd ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  // Bottom Mars coordinates strip
  if (mission.mapCoords) {
    ctx.fillStyle = 'rgba(11, 16, 32, 0.84)';
    ctx.fillRect(0, h - 26, w, 26);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 12px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(mission.mapCoords, 10, h - 13);
  }
}

// ============================================================================
// 12. SCREEN: CODEX & ACHIEVEMENTS
// ============================================================================

function renderCodexScreen() {
  const unlockedCodexSet = new Set(state.playerData.unlockedCodex);
  for (const entry of CODEX_ENTRIES) {
    if (entry.defaultUnlocked || (entry.unlockMission && state.playerData.completedMissions.includes(entry.unlockMission))) {
      unlockedCodexSet.add(entry.id);
    }
  }

  if (dom.codexCounter) {
    dom.codexCounter.textContent = `${unlockedCodexSet.size} / ${CODEX_ENTRIES.length} Unlocked`;
  }

  if (dom.codexGrid) {
    dom.codexGrid.innerHTML = CODEX_ENTRIES.map((entry) => {
      const unlocked = unlockedCodexSet.has(entry.id);
      if (!unlocked) {
        return `
          <article class="hub-codex-card is-locked">
            <div class="hub-codex-locked-mark" aria-hidden="true">?</div>
            <h3 class="hub-codex-title">${HUB_COPY.codex.lockedTitle}</h3>
            <p class="hub-codex-body">${HUB_COPY.codex.lockedHintPrefix} ${entry.unlockHint}</p>
          </article>
        `;
      }
      return `
        <article class="hub-codex-card is-unlocked">
          <span class="hub-codex-category">${entry.category}</span>
          <h3 class="hub-codex-title">${entry.title}</h3>
          <p class="hub-codex-body">${entry.text}</p>
        </article>
      `;
    }).join('');
  }

  const unlockedAchSet = new Set(state.playerData.achievements);
  if (dom.achievementsCounter) {
    dom.achievementsCounter.textContent = `${unlockedAchSet.size} / ${ACHIEVEMENTS.length} Unlocked`;
  }

  if (dom.achievementsGrid) {
    dom.achievementsGrid.innerHTML = ACHIEVEMENTS.map((ach) => {
      const unlocked = unlockedAchSet.has(ach.id);
      return `
        <div class="hub-achievement-card ${unlocked ? 'is-unlocked' : 'is-locked'}">
          <div class="hub-achievement-badge">${svgIcon(unlocked ? ach.icon : 'lock', 20)}</div>
          <div class="hub-achievement-info">
            <span class="hub-achievement-name">${ach.name}</span>
            <span class="hub-achievement-cond">${ach.condition} · ${unlocked ? HUB_COPY.codex.achievementUnlocked : HUB_COPY.codex.achievementLocked}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ============================================================================
// 13. SCREEN: SETTINGS & CREDITS
// ============================================================================

function renderSettingsScreen() {
  if (dom.musicToggle) {
    dom.musicToggle.setAttribute('aria-checked', state.settings.music ? 'true' : 'false');
    dom.musicToggle.querySelector('.hub-toggle-state').textContent = state.settings.music ? 'On' : 'Off';
  }
  if (dom.sfxToggle) {
    dom.sfxToggle.setAttribute('aria-checked', state.settings.sfx ? 'true' : 'false');
    dom.sfxToggle.querySelector('.hub-toggle-state').textContent = state.settings.sfx ? 'On' : 'Off';
  }
  if (dom.qualityButtons) {
    for (const btn of dom.qualityButtons) {
      const q = btn.getAttribute('data-quality');
      btn.setAttribute('aria-checked', q === state.settings.quality ? 'true' : 'false');
    }
  }
  if (dom.callsignInput && document.activeElement !== dom.callsignInput) {
    dom.callsignInput.value = state.settings.callsign;
  }
  if (dom.navCallsignValue) {
    dom.navCallsignValue.textContent = state.settings.callsign;
  }
}

function renderCreditsModal() {
  if (!dom.creditsBody) return;
  const teamHtml = CREDITS_DATA.team
    .map((m) => `<li class="hub-credits-row"><span>${m.role}</span><span class="hub-muted-text">${m.name}</span></li>`)
    .join('');
  const toolsHtml = CREDITS_DATA.tools
    .map((t) => `<li>${t}</li>`)
    .join('');

  dom.creditsBody.innerHTML = `
    <div class="hub-credits-block">
      <h3 class="hub-subsection-title">${HUB_COPY.credits.teamHeading}</h3>
      <ul class="hub-credits-list">${teamHtml}</ul>
    </div>
    <div class="hub-credits-block">
      <h3 class="hub-subsection-title">${HUB_COPY.credits.toolsHeading}</h3>
      <ul class="hub-credits-list">${toolsHtml}</ul>
    </div>
    <div class="hub-credits-block">
      <h3 class="hub-subsection-title">${HUB_COPY.credits.attributionHeading}</h3>
      <p class="hub-modal-body-text">${HUB_COPY.credits.attributionLine}</p>
      <p class="hub-modal-body-text">${HUB_COPY.credits.disclaimerLine}</p>
    </div>
  `;
}

function performProgressReset() {
  state.playerData = createDefaultPlayerData();
  state.selectedRobotId = 'explorer';
  state.inspectedRobotId = 'explorer';
  state.selectedMissionId = 'training1';
  saveToStorage();
  setPreviewRobot(ROBOTS.find((r) => r.id === state.selectedRobotId));
  if (dom.settingsFeedback) {
    dom.settingsFeedback.textContent = HUB_COPY.settings.resetDoneMessage;
  }
  renderActiveScreen();
}

// ============================================================================
// 14. PAUSE OVERLAY
// ============================================================================

function showPause() {
  state.pauseVisible = true;
  if (dom.pauseOverlay) {
    dom.pauseOverlay.hidden = false;
  }
  if (dom.pauseResumeBtn) {
    dom.pauseResumeBtn.focus();
  }
}

function hidePause() {
  state.pauseVisible = false;
  if (dom.pauseOverlay) {
    dom.pauseOverlay.hidden = true;
  }
}

// ============================================================================
// 15. 3D ROBOT PREVIEW (Three.js + Software WebGL Guard + SVG Fallback)
// ============================================================================

const preview3D = {
  ready: false,
  failed: false,
  isSoftwareGl: false,
  renderer: null,
  scene: null,
  camera: null,
  roverGroup: null,
  bodyMat: null,
  trimMat: null,
  accentMat: null,
  solarMat: null,
  wheelMat: null,
  targetYaw: 0.5,
  currentYaw: 0.5,
  targetPitch: 0.16,
  currentPitch: 0.16,
  dragging: false,
  lastPointerX: 0,
  lastPointerY: 0,
  needsOneShotRender: true,
};

function detectSoftwareWebGL() {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function activateSvgRobotFallback() {
  preview3D.failed = true;
  preview3D.ready = false;
  if (dom.robotCanvas) dom.robotCanvas.hidden = true;
  if (dom.robotSvgFallback) {
    dom.robotSvgFallback.hidden = false;
    const robot = ROBOTS.find((r) => r.id === state.inspectedRobotId) || ROBOTS[1];
    renderSvgRoverFallback(dom.robotSvgFallback, robot);
  }
}

function init3DRobotPreview() {
  const canvas = dom.robotCanvas;
  if (!canvas) return;

  preview3D.isSoftwareGl = detectSoftwareWebGL();

  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !preview3D.isSoftwareGl,
      alpha: true,
      powerPreference: 'default',
    });
    renderer.setSize(300, 300, false);
    renderer.setPixelRatio(preview3D.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30);
    camera.position.set(0, 1.35, 4.1);
    camera.lookAt(0, 0.25, 0);

    // Flat directional light + balanced ambient/hemisphere fill, no shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.65);
    dirLight.position.set(3.5, 5, 4);
    scene.add(dirLight);

    const fillLight = new THREE.HemisphereLight(0xdce6ff, 0x2a2330, 0.85);
    scene.add(fillLight);

    const roverGroup = buildRoverModel();
    scene.add(roverGroup);

    preview3D.renderer = renderer;
    preview3D.scene = scene;
    preview3D.camera = camera;
    preview3D.roverGroup = roverGroup;
    preview3D.ready = true;
    preview3D.failed = false;

    setPreviewRobot(ROBOTS.find((r) => r.id === state.inspectedRobotId) || ROBOTS[1]);

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      activateSvgRobotFallback();
    });

    setupPreviewPointerControls(canvas);
  } catch {
    activateSvgRobotFallback();
  }
}

function buildRoverModel() {
  const group = new THREE.Group();

  // Materials (varied roughness & metalness across sub-parts)
  preview3D.bodyMat = new THREE.MeshStandardMaterial({ color: 0xd99b26, roughness: 0.45, metalness: 0.35 });
  preview3D.trimMat = new THREE.MeshStandardMaterial({ color: 0x263047, roughness: 0.65, metalness: 0.45 });
  preview3D.accentMat = new THREE.MeshStandardMaterial({ color: 0xe2572b, roughness: 0.4, metalness: 0.2 });
  preview3D.solarMat = new THREE.MeshStandardMaterial({ color: 0x1a2f5c, roughness: 0.25, metalness: 0.6 });
  preview3D.wheelMat = new THREE.MeshStandardMaterial({ color: 0x181c28, roughness: 0.85, metalness: 0.15 });
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x5dcaa5, roughness: 0.15, metalness: 0.8 });

  // Ground turntable ring (flat reference)
  const padGeo = new THREE.CylinderGeometry(1.35, 1.4, 0.04, 32);
  const padMesh = new THREE.Mesh(padGeo, preview3D.trimMat);
  padMesh.position.y = -0.58;
  group.add(padMesh);

  // Main chassis body box
  const bodyGeo = new THREE.BoxGeometry(1.15, 0.42, 1.55);
  const bodyMesh = new THREE.Mesh(bodyGeo, preview3D.bodyMat);
  bodyMesh.position.set(0, 0.05, 0);
  bodyMesh.name = 'body';
  group.add(bodyMesh);

  // Top solar panel deck
  const solarGeo = new THREE.BoxGeometry(1.42, 0.06, 1.2);
  const solarMesh = new THREE.Mesh(solarGeo, preview3D.solarMat);
  solarMesh.position.set(0, 0.31, -0.08);
  group.add(solarMesh);

  // Rear accent bumper / sample bay
  const bayGeo = new THREE.BoxGeometry(0.7, 0.22, 0.24);
  const bayMesh = new THREE.Mesh(bayGeo, preview3D.accentMat);
  bayMesh.position.set(0, 0.06, -0.82);
  group.add(bayMesh);

  // Vertical mast
  const mastGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.68, 12);
  const mastMesh = new THREE.Mesh(mastGeo, preview3D.trimMat);
  mastMesh.position.set(0.18, 0.62, 0.48);
  group.add(mastMesh);

  // Stereo camera head box
  const camHeadGeo = new THREE.BoxGeometry(0.42, 0.18, 0.22);
  const camHeadMesh = new THREE.Mesh(camHeadGeo, preview3D.trimMat);
  camHeadMesh.position.set(0.18, 0.98, 0.52);
  group.add(camHeadMesh);

  // Two optical camera lenses
  const lensGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.06, 12);
  lensGeo.rotateX(Math.PI / 2);
  const lensLeft = new THREE.Mesh(lensGeo, lensMat);
  lensLeft.position.set(0.09, 0.98, 0.64);
  group.add(lensLeft);

  const lensRight = new THREE.Mesh(lensGeo, lensMat);
  lensRight.position.set(0.27, 0.98, 0.64);
  group.add(lensRight);

  // Six wheels + suspension struts (3 per side)
  const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.18, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.2, 12);
  hubGeo.rotateZ(Math.PI / 2);
  const strutGeo = new THREE.BoxGeometry(0.06, 0.34, 0.06);

  const wheelZPositions = [-0.62, 0, 0.62];
  const sideSigns = [-1, 1];

  for (const side of sideSigns) {
    for (const wz of wheelZPositions) {
      const wheel = new THREE.Mesh(wheelGeo, preview3D.wheelMat);
      wheel.position.set(side * 0.78, -0.34, wz);
      group.add(wheel);

      const hub = new THREE.Mesh(hubGeo, preview3D.accentMat);
      hub.position.set(side * 0.78, -0.34, wz);
      group.add(hub);

      const strut = new THREE.Mesh(strutGeo, preview3D.trimMat);
      strut.position.set(side * 0.64, -0.14, wz);
      strut.rotation.z = side * -0.35;
      group.add(strut);
    }
  }

  return group;
}

function setPreviewRobot(robot) {
  if (!robot) return;
  if (preview3D.failed) {
    renderSvgRoverFallback(dom.robotSvgFallback, robot);
    return;
  }
  if (!preview3D.ready) return;

  preview3D.bodyMat.color.setHex(robot.palette.body);
  preview3D.trimMat.color.setHex(robot.palette.trim);
  preview3D.accentMat.color.setHex(robot.palette.accent);

  // Distinct chassis proportion cues per rover class
  if (robot.id === 'scout') {
    preview3D.roverGroup.scale.set(0.88, 0.92, 0.92);
  } else if (robot.id === 'hauler') {
    preview3D.roverGroup.scale.set(1.08, 1.04, 1.1);
  } else {
    preview3D.roverGroup.scale.set(1, 1, 1);
  }
  preview3D.needsOneShotRender = true;
}

function nudgePreviewSpin() {
  preview3D.targetYaw += 0.9;
  preview3D.needsOneShotRender = true;
}

function setupPreviewPointerControls(canvas) {
  canvas.addEventListener('pointerdown', (e) => {
    triggerAudioUnlock();
    preview3D.dragging = true;
    preview3D.lastPointerX = e.clientX;
    preview3D.lastPointerY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!preview3D.dragging) return;
    const dx = e.clientX - preview3D.lastPointerX;
    const dy = e.clientY - preview3D.lastPointerY;
    preview3D.lastPointerX = e.clientX;
    preview3D.lastPointerY = e.clientY;
    preview3D.targetYaw += dx * 0.012;
    preview3D.targetPitch = Math.max(-0.25, Math.min(0.55, preview3D.targetPitch + dy * 0.008));
    preview3D.needsOneShotRender = true;
  });

  const endDrag = (e) => {
    if (!preview3D.dragging) return;
    preview3D.dragging = false;
    if (canvas.hasPointerCapture && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  };

  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
}

function mountRobotViewportForScreen(screenName) {
  const viewport = dom.robotViewport;
  if (!viewport) return;

  if (screenName === 'home' && dom.homePreviewSlot) {
    dom.homePreviewSlot.appendChild(viewport);
    viewport.hidden = false;
    preview3D.needsOneShotRender = true;
  } else if (screenName === 'garage' && dom.garagePreviewSlot) {
    dom.garagePreviewSlot.appendChild(viewport);
    viewport.hidden = false;
    preview3D.needsOneShotRender = true;
  } else {
    viewport.hidden = true;
  }
}

function render3DRobotFrame(dt) {
  if (!preview3D.ready || preview3D.failed) return;
  if (state.screen !== 'home' && state.screen !== 'garage') return;

  const isReduced = reducedMotionQuery.matches;
  if (!preview3D.dragging && !isReduced) {
    preview3D.targetYaw += dt * 0.45;
  }

  const dampAlpha = isReduced ? 1 : 1 - Math.exp(-10 * dt);
  preview3D.currentYaw += (preview3D.targetYaw - preview3D.currentYaw) * dampAlpha;
  preview3D.currentPitch += (preview3D.targetPitch - preview3D.currentPitch) * dampAlpha;

  preview3D.roverGroup.rotation.y = preview3D.currentYaw;
  preview3D.roverGroup.rotation.x = preview3D.currentPitch;
  preview3D.renderer.render(preview3D.scene, preview3D.camera);
  preview3D.needsOneShotRender = false;
}

function dispose3DRobotPreview() {
  if (!preview3D.renderer) return;
  if (preview3D.scene) {
    preview3D.scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });
  }
  preview3D.renderer.dispose();
  preview3D.renderer = null;
  preview3D.scene = null;
  preview3D.camera = null;
  preview3D.roverGroup = null;
  preview3D.ready = false;
}

// ============================================================================
// 16. SINGLE ANIMATION LOOP
// ============================================================================

function shouldRunLoop() {
  if (!state.visible) return false;
  if (state.screen === 'home') return true;
  if (state.screen === 'garage' && preview3D.ready && !preview3D.failed) return true;
  return false;
}

function tickFrame(now) {
  state.rafId = 0;
  if (!shouldRunLoop()) return;

  const rawDt = state.lastFrameTime ? (now - state.lastFrameTime) / 1000 : 0.016;
  state.lastFrameTime = now;
  const dt = Math.min(rawDt, 0.05);

  if (state.screen === 'home') {
    drawStarfield(dt);
  }
  if (state.screen === 'home' || state.screen === 'garage') {
    if (!reducedMotionQuery.matches || preview3D.dragging || preview3D.needsOneShotRender) {
      render3DRobotFrame(dt);
    }
  }

  state.rafId = window.requestAnimationFrame(tickFrame);
}

function syncLoopState() {
  if (shouldRunLoop()) {
    if (!state.rafId) {
      state.lastFrameTime = performance.now();
      state.rafId = window.requestAnimationFrame(tickFrame);
    }
  } else {
    stopLoop();
  }
}

function stopLoop() {
  if (state.rafId) {
    window.cancelAnimationFrame(state.rafId);
    state.rafId = 0;
  }
}

// ============================================================================
// 17. RENDER ORCHESTRATION & DOM BINDING
// ============================================================================

function renderActiveScreen() {
  switch (state.screen) {
    case 'home':
      renderHomeScreen();
      break;
    case 'garage':
      renderGarageScreen();
      break;
    case 'missions':
      renderMissionsScreen();
      break;
    case 'codex':
      renderCodexScreen();
      break;
    case 'settings':
      renderSettingsScreen();
      break;
    default:
      break;
  }
}

function cacheDom() {
  dom.root = document.getElementById('mission-hub');
  dom.starfield = document.getElementById('hub-starfield');
  dom.navBar = document.getElementById('hub-nav-bar');
  dom.navCallsignValue = document.getElementById('hub-nav-callsign-value');
  dom.tabs = Array.from(document.querySelectorAll('.hub-tab'));
  dom.screens = Array.from(document.querySelectorAll('.hub-screen'));

  // Loading
  dom.loadingPercent = document.getElementById('hub-loading-percent');
  dom.loadingBarTrack = document.getElementById('hub-loading-bar-track');
  dom.loadingBarFill = document.getElementById('hub-loading-bar-fill');
  dom.loadingStatus = document.getElementById('hub-loading-status');
  dom.loadingTip = document.getElementById('hub-loading-tip');
  dom.loadingEnterBtn = document.getElementById('hub-loading-enter-btn');

  // Home
  dom.homePreviewSlot = document.getElementById('hub-home-preview-slot');
  dom.homeCallsign = document.getElementById('hub-home-callsign');
  dom.homeRover = document.getElementById('hub-home-rover');
  dom.homeProgress = document.getElementById('hub-home-progress');
  dom.homeNextText = document.getElementById('hub-home-next-text');
  dom.homeNextLocation = document.getElementById('hub-home-next-location');
  dom.launchBtn = document.getElementById('hub-launch-btn');
  dom.homeMissionsBtn = document.getElementById('hub-home-missions-btn');
  dom.homeLaunchHint = document.getElementById('hub-home-launch-hint');

  // Garage
  dom.garagePreviewSlot = document.getElementById('hub-garage-preview-slot');
  dom.garageSelectedName = document.getElementById('hub-garage-selected-name');
  dom.garageSelectedRole = document.getElementById('hub-garage-selected-role');
  dom.robotCards = document.getElementById('hub-robot-cards');
  dom.garageFeedback = document.getElementById('hub-garage-feedback');
  dom.upgradesGrid = document.getElementById('hub-upgrades-grid');

  // Missions
  dom.missionList = document.getElementById('hub-mission-list');
  dom.detailLocation = document.getElementById('hub-detail-location');
  dom.detailTitle = document.getElementById('hub-detail-title');
  dom.detailStatus = document.getElementById('hub-detail-status');
  dom.detailBriefingLabel = document.getElementById('hub-detail-briefing-label');
  dom.detailDescription = document.getElementById('hub-detail-description');
  dom.minimap = document.getElementById('hub-minimap');
  dom.detailMetrics = document.getElementById('hub-detail-metrics');
  dom.detailStars = document.getElementById('hub-detail-stars');
  dom.detailScore = document.getElementById('hub-detail-score');
  dom.detailObjectives = document.getElementById('hub-detail-objectives');
  dom.detailExtra = document.getElementById('hub-detail-extra');
  dom.detailLockReason = document.getElementById('hub-detail-lock-reason');
  dom.missionStartBtn = document.getElementById('hub-mission-start-btn');

  // Codex & Achievements
  dom.codexCounter = document.getElementById('hub-codex-counter');
  dom.codexGrid = document.getElementById('hub-codex-grid');
  dom.achievementsCounter = document.getElementById('hub-achievements-counter');
  dom.achievementsGrid = document.getElementById('hub-achievements-grid');

  // Settings & Modals
  dom.musicToggle = document.getElementById('hub-setting-music');
  dom.sfxToggle = document.getElementById('hub-setting-sfx');
  dom.qualityButtons = Array.from(document.querySelectorAll('#hub-setting-quality-group .hub-seg-btn'));
  dom.callsignInput = document.getElementById('hub-setting-callsign');
  dom.replayIntroBtn = document.getElementById('hub-replay-intro-btn');
  dom.creditsBtn = document.getElementById('hub-credits-btn');
  dom.resetBtn = document.getElementById('hub-reset-btn');
  dom.settingsFeedback = document.getElementById('hub-settings-feedback');

  dom.creditsModal = document.getElementById('hub-credits-modal');
  dom.creditsBody = document.getElementById('hub-credits-body');
  dom.creditsCloseBtn = document.getElementById('hub-credits-close-btn');

  dom.resetModal = document.getElementById('hub-reset-modal');
  dom.resetBody = document.getElementById('hub-reset-body');
  dom.resetCancelBtn = document.getElementById('hub-reset-cancel-btn');
  dom.resetConfirmBtn = document.getElementById('hub-reset-confirm-btn');

  // Pause overlay
  dom.pauseOverlay = document.getElementById('hub-pause-overlay');
  dom.pauseResumeBtn = document.getElementById('hub-pause-resume-btn');
  dom.pauseRestartBtn = document.getElementById('hub-pause-restart-btn');
  dom.pauseBackBtn = document.getElementById('hub-pause-back-btn');

  // Intro video overlay
  dom.introOverlay = document.getElementById('hub-intro-overlay');
  dom.introVideo = document.getElementById('hub-intro-video');
  dom.introControls = document.getElementById('hub-intro-controls');
  dom.introMuteBtn = document.getElementById('hub-intro-mute-btn');
  dom.introSkipBtn = document.getElementById('hub-intro-skip-btn');

  // 3D robot viewport
  dom.robotViewport = document.getElementById('hub-robot-viewport');
  dom.robotCanvas = document.getElementById('hub-robot-canvas');
  dom.robotSvgFallback = document.getElementById('hub-robot-svg-fallback');
}

function bindEvents() {
  document.addEventListener('pointerdown', triggerAudioUnlock, { passive: true });
  document.addEventListener('keydown', handleGlobalKeydown);
  window.addEventListener('resize', handleWindowResize);

  setupTabKeyboardNavigation();

  if (dom.loadingEnterBtn) {
    dom.loadingEnterBtn.addEventListener('click', () => {
      if (state.progress >= 100) showScreen('home');
    });
  }

  if (dom.launchBtn) {
    dom.launchBtn.addEventListener('click', () => {
      const rec = getRecommendedMission();
      launchMission(rec.id);
    });
  }

  if (dom.homeMissionsBtn) {
    dom.homeMissionsBtn.addEventListener('click', () => {
      showScreen('missions');
    });
  }

  if (dom.missionStartBtn) {
    dom.missionStartBtn.addEventListener('click', () => {
      launchMission(state.selectedMissionId);
    });
  }

  // Settings handlers
  if (dom.musicToggle) {
    dom.musicToggle.addEventListener('click', () => {
      state.settings.music = !state.settings.music;
      saveToStorage();
      renderSettingsScreen();
      emitSettingsChange();
    });
  }

  if (dom.sfxToggle) {
    dom.sfxToggle.addEventListener('click', () => {
      state.settings.sfx = !state.settings.sfx;
      saveToStorage();
      renderSettingsScreen();
      emitSettingsChange();
    });
  }

  for (const btn of dom.qualityButtons) {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-quality');
      if (q && VALID_QUALITIES.has(q)) {
        state.settings.quality = q;
        saveToStorage();
        renderSettingsScreen();
        emitSettingsChange();
      }
    });
  }

  if (dom.callsignInput) {
    dom.callsignInput.addEventListener('input', () => {
      const filtered = dom.callsignInput.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
      if (dom.callsignInput.value !== filtered) {
        dom.callsignInput.value = filtered;
      }
      state.settings.callsign = filtered.length > 0 ? filtered : 'ROVER01';
      if (dom.navCallsignValue) dom.navCallsignValue.textContent = state.settings.callsign;
      saveToStorage();
      emitSettingsChange();
    });

    dom.callsignInput.addEventListener('blur', () => {
      dom.callsignInput.value = state.settings.callsign;
    });
  }

  if (dom.replayIntroBtn) {
    dom.replayIntroBtn.addEventListener('click', () => {
      if (typeof state.callbacks.onReplayIntro === 'function') {
        state.callbacks.onReplayIntro();
      }
      playIntroVideo(() => {
        showHub('settings');
      });
    });
  }

  if (dom.creditsBtn) {
    dom.creditsBtn.addEventListener('click', () => {
      renderCreditsModal();
      if (dom.creditsModal) dom.creditsModal.hidden = false;
      if (dom.creditsCloseBtn) dom.creditsCloseBtn.focus();
    });
  }

  if (dom.creditsCloseBtn) {
    dom.creditsCloseBtn.addEventListener('click', () => {
      if (dom.creditsModal) dom.creditsModal.hidden = true;
      if (dom.creditsBtn) dom.creditsBtn.focus();
    });
  }

  if (dom.creditsModal) {
    dom.creditsModal.addEventListener('click', (e) => {
      if (e.target === dom.creditsModal) {
        dom.creditsModal.hidden = true;
        if (dom.creditsBtn) dom.creditsBtn.focus();
      }
    });
  }

  if (dom.resetBtn) {
    dom.resetBtn.addEventListener('click', () => {
      if (dom.resetBody) dom.resetBody.textContent = HUB_COPY.settings.resetConfirmBody;
      if (dom.resetModal) dom.resetModal.hidden = false;
      if (dom.resetCancelBtn) dom.resetCancelBtn.focus();
    });
  }

  if (dom.resetCancelBtn) {
    dom.resetCancelBtn.addEventListener('click', () => {
      if (dom.resetModal) dom.resetModal.hidden = true;
      if (dom.resetBtn) dom.resetBtn.focus();
    });
  }

  if (dom.resetConfirmBtn) {
    dom.resetConfirmBtn.addEventListener('click', () => {
      if (dom.resetModal) dom.resetModal.hidden = true;
      performProgressReset();
      if (dom.resetBtn) dom.resetBtn.focus();
    });
  }

  if (dom.resetModal) {
    dom.resetModal.addEventListener('click', (e) => {
      if (e.target === dom.resetModal) {
        dom.resetModal.hidden = true;
        if (dom.resetBtn) dom.resetBtn.focus();
      }
    });
  }

  // Pause overlay buttons
  if (dom.pauseResumeBtn) {
    dom.pauseResumeBtn.addEventListener('click', () => {
      hidePause();
      if (typeof state.callbacks.onResume === 'function') {
        state.callbacks.onResume();
      }
    });
  }

  if (dom.pauseRestartBtn) {
    dom.pauseRestartBtn.addEventListener('click', () => {
      hidePause();
      if (typeof state.callbacks.onRestart === 'function') {
        state.callbacks.onRestart();
      }
    });
  }

  if (dom.pauseBackBtn) {
    dom.pauseBackBtn.addEventListener('click', () => {
      hidePause();
      if (typeof state.callbacks.onBackToHub === 'function') {
        state.callbacks.onBackToHub();
      }
      showHub('missions');
    });
  }

  // Intro video overlay handlers
  if (dom.introVideo) {
    dom.introVideo.addEventListener('ended', handleIntroEnded);
    dom.introVideo.addEventListener('timeupdate', () => {
      if (dom.introVideo.duration && dom.introVideo.currentTime >= dom.introVideo.duration - 0.08) {
        handleIntroEnded();
      }
    });
    dom.introVideo.addEventListener('error', () => finishIntroVideo());
  }

  if (dom.introOverlay) {
    dom.introOverlay.addEventListener('click', (e) => {
      if (state.introWaitingForKey && e.target !== dom.introMuteBtn) {
        finishIntroVideo();
      }
    });
  }

  if (dom.introSkipBtn) {
    dom.introSkipBtn.addEventListener('keydown', (e) => {
      if (state.introPlaying && !state.introWaitingForKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    dom.introSkipBtn.addEventListener('click', (e) => {
      // Ignore synthetic keyboard clicks while playing
      if (e.detail === 0 && state.introPlaying && !state.introWaitingForKey) {
        e.preventDefault();
        return;
      }
      finishIntroVideo();
    });
  }

  if (dom.introMuteBtn && dom.introVideo) {
    dom.introMuteBtn.addEventListener('click', () => {
      dom.introVideo.muted = !dom.introVideo.muted;
      updateIntroMuteButton();
    });
  }
}

function handleWindowResize() {
  resizeStarfield();
  if (state.screen === 'home' && reducedMotionQuery.matches) {
    drawStarfield(0);
  }
}

// ============================================================================
// 18. PUBLIC DATA CONTRACT (window.Hub)
// ============================================================================

const Hub = {
  init(callbacks = {}) {
    state.callbacks = {
      onLaunch: callbacks.onLaunch || null,
      onReplayIntro: callbacks.onReplayIntro || null,
      onSettingsChange: callbacks.onSettingsChange || null,
      onAudioUnlock: callbacks.onAudioUnlock || null,
      onRestart: callbacks.onRestart || null,
      onResume: callbacks.onResume || null,
      onBackToHub: callbacks.onBackToHub || null,
    };

    if (!state.initialized) {
      cacheDom();
      loadFromStorage();
      initStarfield();
      init3DRobotPreview();
      bindEvents();
      startLoadingTips();
      state.initialized = true;
    }

    showScreen('loading');
    setProgress(state.progress);
    emitSettingsChange();
  },

  setProgress(value) {
    setProgress(value);
  },

  show(screenName) {
    showHub(screenName);
  },

  hide() {
    hideHub();
  },

  setPlayerData(data) {
    state.playerData = validatePlayerData(data);
    saveToStorage();
    renderActiveScreen();
  },

  getPlayerData() {
    return clonePlayerData(state.playerData);
  },

  showPause() {
    showPause();
  },

  hidePause() {
    hidePause();
  },

  destroy() {
    state.introPlaying = false;
    state.introWaitingForKey = false;
    state.introDoneCallback = null;
    if (dom.introControls) dom.introControls.hidden = false;
    if (dom.introVideo) {
      dom.introVideo.pause();
      dom.introVideo.removeAttribute('src');
    }
    if (dom.introOverlay) dom.introOverlay.hidden = true;
    stopLoop();
    stopLoadingTips();
    dispose3DRobotPreview();
    document.removeEventListener('pointerdown', triggerAudioUnlock);
    document.removeEventListener('keydown', handleGlobalKeydown);
    window.removeEventListener('resize', handleWindowResize);
    state.initialized = false;
  },

  // Helper exposed for test/demo mode reset
  _seedDemoData() {
    state.playerData = validatePlayerData(DEMO_PLAYER_DATA);
    saveToStorage();
    renderActiveScreen();
  },
};

window.Hub = Hub;
export default Hub;
