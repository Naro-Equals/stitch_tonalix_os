---
name: Tonalix TV Dark
colors:
  surface: '#0e141a'
  surface-dim: '#0e141a'
  surface-bright: '#343a41'
  surface-container-lowest: '#090f15'
  surface-container-low: '#161c22'
  surface-container: '#1a2027'
  surface-container-high: '#252b31'
  surface-container-highest: '#2f353c'
  on-surface: '#dde3ec'
  on-surface-variant: '#bac9cc'
  inverse-surface: '#dde3ec'
  inverse-on-surface: '#2b3138'
  outline: '#849396'
  outline-variant: '#3b494c'
  surface-tint: '#00daf3'
  primary: '#c3f5ff'
  on-primary: '#00363d'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#006875'
  secondary: '#83ffcc'
  on-secondary: '#003826'
  secondary-container: '#09e7a9'
  on-secondary-container: '#006346'
  tertiary: '#e2eeff'
  on-tertiary: '#1d3246'
  tertiary-container: '#bdd3ed'
  on-tertiary-container: '#465b71'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#42ffbf'
  secondary-fixed-dim: '#00e1a4'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#005139'
  tertiary-fixed: '#cfe5ff'
  tertiary-fixed-dim: '#b3c9e2'
  on-tertiary-fixed: '#051d30'
  on-tertiary-fixed-variant: '#34495e'
  background: '#0e141a'
  on-background: '#dde3ec'
  surface-variant: '#2f353c'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a high-end cinematic entertainment environment engineered for deep immersion, low eye fatigue in darkened rooms, and lightning-fast media navigation. Crafted for home theater buffs, tech-forward streamers, and premium media collectors, it bridges sleek architectural minimalism with electric cyberpunk clarity. 

Visual tone targets focused serenity punctured by vibrant luminescence. Content—cover art, live streams, and high-fidelity video metadata—remains the central hero. The backdrop is quiet, bottomless, and structural, avoiding noisy ornamentation while letting neon highlights command dynamic focus states and interactive moments.

## Colors

The palette revolves around deep oceanic black and structural slate surfaces accented by hyper-vibrant illumination:

- **Primary (`#00e5ff`):** Luminous Cyan. Reserved for active navigation items, focused state halos, scrubbers, and primary calls to action.
- **Secondary (`#00e6a8`):** Vivid Teal / Emerald. Used for positive states, release metadata badges ("4K HDR", "New Episode"), audio fidelity tags, and active playback confirmations.
- **Tertiary (`#1e3347`):** Slate Structural Outline. Used for crisp structural borders, card separators, and low-priority framing.
- **Neutral Canvas (`#080e14` to `#0b141d`):** Deep oceanic black void foundation providing maximum contrast for vibrant media artwork.
- **Surface Elevation (`#111e29`):** Card tiles, modal drawers, and navigation rails.
- **Text & Hierarchy:** Bright White (`#f0f6fc`) for headline titles, muted ice-gray (`#8b9eb3`) for cast details and secondary specs, and subdued steel (`#41576d`) for inactive metadata and helper labels.

## Typography

The typographic system pairs the crisp, tech-infused geometry of **Space Grotesk** for titles, display numbers, and technical tags with the refined, neutral legibility of **Manrope** for synopses, cast info, and contextual content.

All metadata labels and technical specs (bitrate, codecs, runtimes) lean on `Space Grotesk` uppercase tracking to ensure immediate recognizability at 10-foot viewing distances as well as mobile displays. Body copy retains relaxed leading and neutral geometry to keep long-form show overviews highly readable over darker backdrops.

## Layout & Spacing

The layout operates on a fluid, modular horizontal canvas optimized for TV remotes, keyboard navigation, and touch interactions:

- **Desktop & Living Room TV Displays:** Standard 12-column grid with a pinned or auto-collapsing vertical icon rail (80px to 240px wide). Margins are generous (`margin: 3rem`) to avoid TV overscan and retain a theater-like widescreen presence.
- **Shelves & Rail Carousels:** Media rows utilize negative overflow gutters with snap scrolling, maintaining uniform horizontal gap spacing (`gutter: 1.5rem`).
- **Mobile & Tablet:** Collapses to 4 and 8 columns with slim margins (`margin-mobile: 1.25rem`) and tighter item separation (`gutter-mobile: 0.75rem`), converting sidebar navigation into a frosted glass bottom tab bar.

## Elevation & Depth

Visual depth is achieved through delicate ambient layering, micro-borders, and targeted cyan luminescence rather than muddy heavy shadows:

- **Ground Layer (Canvas):** `#080e14` with ambient vignette falloffs.
- **Card Surfaces (`#111e29`):** Layered with a delicate 1px perimeter outline (`rgba(255, 255, 255, 0.07)` or `#1e3347`).
- **Focus & Active Elevation:** Focused elements scale up subtly (1.03x to 1.05x) and acquire a double-ring boundary: an inner 1px `#00e5ff` line supported by a soft luminous neon drop blur (`box-shadow: 0 0 24px -2px rgba(0, 229, 255, 0.35)`).
- **Overlays & Drawers:** High-blur dark frosted glass (`background: rgba(11, 20, 29, 0.85); backdrop-filter: blur(20px)`), bordered by a razor-thin structural line (`rgba(0, 229, 255, 0.15)`).

## Shapes

The geometric framework balances sleek technical precision with comfortable modern radiuses. Standard cards, video thumbnails, and dialog containers use 12px to 16px corner radiuses (`rounded-md` to `rounded-lg`). 

Micro-elements such as badges, status indicators, and chip pills employ fully circularized capsule shapes (`9999px`) to visually stand out against rectangular cover art and widescreen cinematic assets. Interactive input fields share the 12px profile, creating unified geometric continuity across controls and cards.

## Components

### Buttons
- **Primary:** Filled `#00e5ff` background with pitch black text (`#080e14`), font weight 600. On focus/hover, glows with an outer cyan corona (`box-shadow: 0 0 18px rgba(0, 229, 255, 0.45)`).
- **Secondary / Ghost:** `#111e29` background with 1px border `#1e3347` and white text. Focus shifts the border to `#00e5ff`.
- **Media Play Action:** Large 56px circular button with primary cyan fill and sharp dark play glyph.

### Media Cards & Posters
- Built on `#111e29` with 12px–16px rounded corners and a 1px border (`#1e3347`).
- Hover/D-pad focus triggers scale transition (1.04x, cubic-bezier(0.16, 1, 0.3, 1)) accompanied by cyan border stroke and bottom neon drop shadow.
- Built-in bottom gradient scrim for legible superimposed titles and duration timestamps.

### Badges & Pill Chips
- **Format Badges (4K, HDR, Atmos):** Monospaced-inspired uppercase labels enclosed in semi-translucent capsules (`background: rgba(30, 51, 71, 0.6); border: 1px solid rgba(255, 255, 255, 0.1)`).
- **Highlight Badges (New, Live):** Secondary teal tint (`background: rgba(0, 230, 168, 0.15); border: 1px solid #00e6a8; color: #00e6a8`).

### Switches & Toggles
- Compact track using `#1e3347` (off) and `#00e5ff` (on).
- Handle uses crisp white `#f0f6fc` with smooth 180ms ease transitions.

### Scrubber & Progress Bars
- Inactive track `#1e3347` at 4px height; active buffered segment uses semi-translucent cyan; played head uses solid `#00e5ff` with a glowing 12px thumb on interaction.

### Form Inputs
- Background `#0b141d`, border 1px `#1e3347`, text `#f0f6fc`.
- Focus illuminates the border in `#00e5ff` with a subtle inner glow.