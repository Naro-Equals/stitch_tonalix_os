export type LauncherTab = 'inicio' | 'aplicaciones' | 'entradas';

export type AppCategory = 'streaming' | 'utilidades' | 'juegos';

export type WallpaperId = 'obsidian' | 'alpine' | 'oled' | 'slate' | 'emerald_mist';

export type CardSize = 'compact' | 'standard' | 'large';

export type IconShape = 'banner_16_9' | 'tonalix_square';

export type LayoutPresetId =
  | 'tonalix_dock'
  | 'fire_tv'
  | 'leanback'
  | 'solo_apps'
  | 'dock_zen'
  | 'sidebar_pro'
  | 'bento_cinema';

export type DeviceProfileId =
  | 'fire_tv_lite'
  | 'fire_tv_4k'
  | 'google_tv'
  | 'xiaomi_box'
  | 'shield_pro';

export type TvResolution = '720p' | '1080p' | '4k';
export type TvPanelType = 'led' | 'oled';

export interface TvCalibration {
  autoOptimize: boolean;
  deviceProfile: DeviceProfileId;
  tvInches: number;
  viewingDistanceM: number;
  resolution: TvResolution;
  panelType: TvPanelType;
  overscanPercent: 0 | 2 | 4;
  lowRamMode: boolean;
}

export interface ComputedTvMetrics {
  fovDegrees: number;
  columns: number;
  cardSize: CardSize;
  iconShape: IconShape;
  uiScale: number;
  ramBudgetMb: number;
  reduceMotion: boolean;
  comfortLabel: string;
  summary: string;
}

export interface NightModeConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
  warmAccentColor: string;
  warmSurfaceTint: string;
  nightBrightness: number;
  warmFilterOpacity: number;
  forcePreview: boolean;
}

export interface DiagnosticReport {
  timestamp: number;
  cpuResponseMs: number;
  frameTimeMs: number;
  networkLatencyMs: number | null;
  networkOnline: boolean;
  hardwareCores: number;
  deviceMemoryGb: number | null;
  recommendedDevice: DeviceProfileId;
  recommendedLowRam: boolean;
  recommendedPreset: LayoutPresetId;
  recommendedReason: string;
}

export interface QuickBarVisibility {
  showSearch: boolean;
  showTurboBoost: boolean;
  showWifi: boolean;
  showBluetooth: boolean;
  showGameMode: boolean;
  showDistanceInputs: boolean;
  showRamHealth: boolean;
  showFirewall: boolean;
  showShareQr: boolean;
  showVoiceCommand: boolean;
}

export interface TvApp {
  id: string;
  name: string;
  subtitle: string;
  category: AppCategory;
  accentColor: string;
  surfaceGradient: string;
  iconType:
    | 'youtube'
    | 'smarttube'
    | 'ytmusic'
    | 'netflix'
    | 'prime'
    | 'disney'
    | 'max'
    | 'stremio'
    | 'kodi'
    | 'plex'
    | 'spotify'
    | 'twitch'
    | 'pluto'
    | 'vix'
    | 'claro'
    | 'azteca'
    | 'tubi'
    | 'xbox'
    | 'vlc'
    | 'files'
    | 'browser'
    | 'downloader'
    | 'cleaner'
    | 'firewall'
    | 'system_settings'
    | 'retroarch'
    | 'moonlight'
    | 'steamlink'
    | 'custom';
  isCustom?: boolean;
  customUrl?: string;
}

export interface FeaturedItem {
  id: string;
  title: string;
  appName: string;
  appId: string;
  meta: string;
  progressPercent: number;
  backdropUrl: string;
}

export interface HdmiInput {
  id: string;
  name: string;
  sourceLabel: string;
  resolution: string;
  connected: boolean;
  icon: 'tv' | 'gamepad' | 'speaker' | 'usb';
}

export interface LauncherSettings {
  layoutPreset: LayoutPresetId;
  iconShape: IconShape;
  wallpaper: WallpaperId;
  wallpaperBrightness: number;
  accentColor: string;
  surfaceTint: string;
  ambientGlow: boolean;
  cardSize: CardSize;
  gridColumns: number;
  showFeatured: boolean;
  showClock: boolean;
  showHints: boolean;
  soundEnabled: boolean;
  wifiConnected: boolean;
  bluetoothConnected: boolean;
  gameMode: boolean;
  autoSwitchGamesOnGameMode: boolean;
  firewallEnabled: boolean;
  bootAppId: string | null;
  isDefaultLauncher: boolean;
  oledProtector: boolean;
  oledPixelShift: boolean;
  quickBar: QuickBarVisibility;
  calibration: TvCalibration;
  nightMode: NightModeConfig;
}

export interface UserSessionData {
  settings: LauncherSettings;
  pinnedIds: string[];
  hiddenIds: string[];
  customApps: TvApp[];
}

export type AvatarIconId =
  | 'user'
  | 'home'
  | 'star'
  | 'game'
  | 'music'
  | 'film'
  | 'shield'
  | 'heart';

export interface UserProfile {
  id: string;
  name: string;
  roleLabel: string;
  avatarColor: string;
  avatarIcon: AvatarIconId;
  pin: string;
  lockOnTvOff: boolean;
  data: UserSessionData;
}

export interface SharedLauncherConfig {
  v: 1;
  settings: LauncherSettings;
  pinnedIds: string[];
  hiddenIds: string[];
  customApps: TvApp[];
}
