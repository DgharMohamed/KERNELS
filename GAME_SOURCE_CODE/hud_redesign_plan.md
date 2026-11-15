# Streamlined HUD Architecture Plan (Updated)

## 1. Updated Layout Overview

- **Bottom-Left:** **EMPTY / COMPLETELY CLEAR** (no radar dial, unobstructed terrain view).
- **Top-Right (Quest):** **Simple, compact bar-style objective chip** (icon + short target name + clean progress/distance indicator, minimal text, matching the battery bar style).
- **Top-Center:** Compass ribbon tape (`NW · · N · · NE`) with green objective heading arrow.
- **Top-Left:** Clean telemetry card (Speed, Slope, Tau opacity).
- **Bottom-Right:** Battery power bar with `⚡` icon and clean segmented fill.

```
+-------------------------------------------------------------------------------------------------+
|  [ TOP-LEFT: TELEMETRY ]            [ TOP-CENTER: COMPASS TAPE ]           [ TOP-RIGHT: QUEST ]  |
|  ┌───────────────────────────┐          NW  ·  ·  N  ·  ·  NE              ┌──────────────────┐  |
|  │ SPEED: 6.4 m/s            │                  ▼                          │ 🎯 OUTCROP [68m] │  |
|  │ SLOPE: +2.1°              │            [Target Marker]                  │ [████████░░░░]   │  |
|  │ TAU: 0.38 (Clear)         │                                             └──────────────────┘  |
|  └───────────────────────────┘                                                                   |
|                                                                                                  |
|                                                                                                  |
|                                                                                                  |
|  [ BOTTOM-LEFT: CLEAR / EMPTY ]                                         [ BOTTOM-RIGHT: BATTERY ]|
|                                                                           ⚡ [████████████░░] 84% |
|                                                                                                  |
+-------------------------------------------------------------------------------------------------+
```

---

## 2. Component Details

1. **Top-Left (`TelemetryCard`)**:
   - Compact semi-transparent dark panel at `(20, 20)`.
   - Speed (`m/s`), Incline (`deg`), and Dust Opacity (`Tau`).
2. **Top-Center (`CompassRibbon`)**:
   - Clean horizontal strip showing tick marks and cardinals.
   - Rotates smoothly with rover/camera yaw.
   - Objective diamond pointing toward the rock target.
3. **Top-Right (`CompactQuestBar`)**:
   - Simple chip styled identically to the power bar.
   - Target Icon (`🎯`) + Target name + Distance tag (`[68m]`).
   - Slim progress bar indicating proximity (fills as you reach drilling range).
4. **Bottom-Left**:
   - **Completely clear**.
5. **Bottom-Right (`BatteryGauge`)**:
   - `⚡` Icon + segmented colored bar (Green $\rightarrow$ Amber $\rightarrow$ Red) + percentage.
