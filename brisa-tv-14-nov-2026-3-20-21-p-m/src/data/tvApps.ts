import {
  FeaturedItem,
  HdmiInput,
  LauncherSettings,
  LayoutPresetId,
  TvApp,
  UserProfile,
  WallpaperId,
} from '../types/launcher';

export const WALLPAPERS: Record<
  WallpaperId,
  {
    id: WallpaperId;
    name: string;
    description: string;
    imageUrl?: string;
    bgClass: string;
  }
> = {
  emerald_mist: {
    id: 'emerald_mist',
    name: 'Niebla Esmeralda Tonalix',
    description: 'Estilo Tonalix oscuro con matiz verde profundo',
    bgClass:
      'bg-[radial-gradient(ellipse_at_top_left,_#0D2426_0%,_#091318_48%,_#07090D_100%)]',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Ondas Obsidiana',
    description: 'Superficie mate oscura y silenciosa',
    imageUrl: '/src/assets/images/wallpaper_obsidian_waves_1794690373083.jpg',
    bgClass: 'bg-[#090B10]',
  },
  alpine: {
    id: 'alpine',
    name: 'Crepúsculo Alpino',
    description: 'Horizonte nocturno en tono pizarra',
    imageUrl: '/src/assets/images/wallpaper_alpine_dusk_1794690373682.jpg',
    bgClass: 'bg-[#0B1018]',
  },
  oled: {
    id: 'oled',
    name: 'Negro Puro OLED',
    description: 'Cero distracciones, ahorro máximo',
    bgClass: 'bg-[#040507]',
  },
  slate: {
    id: 'slate',
    name: 'Pizarra Nocturna',
    description: 'Gradiente radial Android TV clásico',
    bgClass: 'bg-[radial-gradient(ellipse_at_top,_#172030_0%,_#0B0D12_65%,_#07080B_100%)]',
  },
};

export interface LayoutPresetMeta {
  id: LayoutPresetId;
  name: string;
  description: string;
}

export const LAYOUT_PRESETS: LayoutPresetMeta[] = [
  {
    id: 'tonalix_dock',
    name: 'Tonalix Dock',
    description: 'Barra multimedia destacada + dock inferior ultraligero',
  },
  {
    id: 'fire_tv',
    name: 'Fire TV Stick',
    description: 'Héroe superior + tira rápida de apps + filas horizontales',
  },
  {
    id: 'leanback',
    name: 'Android TV Clásico',
    description: 'Banner compacto superior + carruseles por categoría',
  },
  {
    id: 'solo_apps',
    name: 'Solo Apps Ligero',
    description: 'Cuadrícula pura sin banners ni distracciones',
  },
  {
    id: 'dock_zen',
    name: 'Dock Zen Minimal',
    description: 'Reloj central protagonista + dock inferior limpio',
  },
  {
    id: 'sidebar_pro',
    name: 'Barra Lateral Pro',
    description: 'Menú izquierdo rápido + cuadrícula adaptable',
  },
  {
    id: 'bento_cinema',
    name: 'Cine Compacto',
    description: 'Destacado y 4 accesos rápidos lado a lado',
  },
];

export interface ColorPaletteOption {
  id: string;
  name: string;
  accentColor: string;
  surfaceTint: string;
}

export const COLOR_PALETTES: ColorPaletteOption[] = [
  {
    id: 'tonalix_cyan',
    name: 'Esmeralda Tonalix',
    accentColor: '#22D3EE',
    surfaceTint: '#0C1A20',
  },
  {
    id: 'crystal',
    name: 'Blanco Cristal',
    accentColor: '#FFFFFF',
    surfaceTint: '#11151E',
  },
  {
    id: 'fire_blue',
    name: 'Azul Fire TV',
    accentColor: '#38BDF8',
    surfaceTint: '#0E1928',
  },
  {
    id: 'emerald',
    name: 'Verde OLED',
    accentColor: '#34D399',
    surfaceTint: '#0B1D17',
  },
  {
    id: 'amber',
    name: 'Ámbar Cine',
    accentColor: '#FBBF24',
    surfaceTint: '#1C170E',
  },
  {
    id: 'violet',
    name: 'Violeta Gamer',
    accentColor: '#A78BFA',
    surfaceTint: '#161224',
  },
  {
    id: 'crimson',
    name: 'Carmesí Vivo',
    accentColor: '#FB7185',
    surfaceTint: '#201116',
  },
];

export interface QuickProfile {
  id: string;
  name: string;
  description: string;
  patch: Partial<LauncherSettings>;
}

export const QUICK_PROFILES: QuickProfile[] = [
  {
    id: 'tonalix_ultra',
    name: 'Tonalix Turbo Light',
    description: 'Dock esmeralda ultraligero ideal para TV Box 1.5 GB',
    patch: {
      layoutPreset: 'tonalix_dock',
      iconShape: 'tonalix_square',
      wallpaper: 'emerald_mist',
      accentColor: '#22D3EE',
      surfaceTint: '#0C1A20',
      ambientGlow: true,
    },
  },
  {
    id: 'fire_stick',
    name: 'Estilo Fire TV',
    description: 'Banner amplio + tira de apps y filas streaming',
    patch: {
      layoutPreset: 'fire_tv',
      iconShape: 'banner_16_9',
      wallpaper: 'obsidian',
      accentColor: '#38BDF8',
      surfaceTint: '#0E1928',
      ambientGlow: true,
    },
  },
  {
    id: 'cinema_night',
    name: 'Cine Nocturno OLED',
    description: 'Negro puro, tono ámbar y vista compacta',
    patch: {
      layoutPreset: 'bento_cinema',
      iconShape: 'banner_16_9',
      wallpaper: 'oled',
      accentColor: '#FBBF24',
      surfaceTint: '#12100C',
      wallpaperBrightness: 40,
    },
  },
  {
    id: 'gamer_room',
    name: 'Modo Gamer TV',
    description: 'Prioriza emuladores, Xbox Cloud y Moonlight',
    patch: {
      layoutPreset: 'sidebar_pro',
      iconShape: 'banner_16_9',
      wallpaper: 'slate',
      accentColor: '#A78BFA',
      surfaceTint: '#161224',
      gameMode: true,
    },
  },
];

export const INITIAL_APPS: TvApp[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    subtitle: 'Vídeos y canales 4K',
    category: 'streaming',
    accentColor: '#FF0033',
    surfaceGradient: 'from-[#2A0B10] via-[#190A0D] to-[#111318]',
    iconType: 'youtube',
  },
  {
    id: 'ytmusic',
    name: 'YouTube Music',
    subtitle: 'Álbumes y listas musicales',
    category: 'streaming',
    accentColor: '#FF1744',
    surfaceGradient: 'from-[#2B0C14] via-[#180A0E] to-[#111318]',
    iconType: 'ytmusic',
  },
  {
    id: 'smarttube',
    name: 'SmartTube',
    subtitle: 'Reproductor ligero sin pausas',
    category: 'streaming',
    accentColor: '#E11D48',
    surfaceGradient: 'from-[#280D16] via-[#170C12] to-[#111318]',
    iconType: 'smarttube',
  },
  {
    id: 'netflix',
    name: 'Netflix',
    subtitle: 'Series y cine',
    category: 'streaming',
    accentColor: '#E50914',
    surfaceGradient: 'from-[#2A090C] via-[#180A0C] to-[#111318]',
    iconType: 'netflix',
  },
  {
    id: 'prime',
    name: 'Prime Video',
    subtitle: 'Cine y deportes',
    category: 'streaming',
    accentColor: '#00A8E1',
    surfaceGradient: 'from-[#082433] via-[#0B1721] to-[#111318]',
    iconType: 'prime',
  },
  {
    id: 'vix',
    name: 'ViX',
    subtitle: 'Novelas, deportes y en vivo',
    category: 'streaming',
    accentColor: '#FF5A1F',
    surfaceGradient: 'from-[#33160A] via-[#1D0F09] to-[#111318]',
    iconType: 'vix',
  },
  {
    id: 'claro',
    name: 'Claro Video',
    subtitle: 'Películas y canales TV',
    category: 'streaming',
    accentColor: '#EF4444',
    surfaceGradient: 'from-[#2B1012] via-[#190C0E] to-[#111318]',
    iconType: 'claro',
  },
  {
    id: 'azteca',
    name: 'TV Azteca',
    subtitle: 'Señal en vivo gratis',
    category: 'streaming',
    accentColor: '#8B5CF6',
    surfaceGradient: 'from-[#20143A] via-[#140F24] to-[#111318]',
    iconType: 'azteca',
  },
  {
    id: 'tubi',
    name: 'Tubi',
    subtitle: 'Cine gratis bajo demanda',
    category: 'streaming',
    accentColor: '#A855F7',
    surfaceGradient: 'from-[#27103B] via-[#160D24] to-[#111318]',
    iconType: 'tubi',
  },
  {
    id: 'disney',
    name: 'Disney+',
    subtitle: 'Catálogo familiar',
    category: 'streaming',
    accentColor: '#113CCF',
    surfaceGradient: 'from-[#0B183D] via-[#0D1326] to-[#111318]',
    iconType: 'disney',
  },
  {
    id: 'max',
    name: 'Max',
    subtitle: 'Estrenos y documentales',
    category: 'streaming',
    accentColor: '#2563EB',
    surfaceGradient: 'from-[#0C1D42] via-[#0E1426] to-[#111318]',
    iconType: 'max',
  },
  {
    id: 'stremio',
    name: 'Stremio',
    subtitle: 'Catálogo multimedia',
    category: 'streaming',
    accentColor: '#8A5CF5',
    surfaceGradient: 'from-[#1F1538] via-[#141024] to-[#111318]',
    iconType: 'stremio',
  },
  {
    id: 'kodi',
    name: 'Kodi',
    subtitle: 'Centro multimedia local',
    category: 'streaming',
    accentColor: '#17B2E7',
    surfaceGradient: 'from-[#0D2533] via-[#0E1922] to-[#111318]',
    iconType: 'kodi',
  },
  {
    id: 'plex',
    name: 'Plex',
    subtitle: 'Servidor personal',
    category: 'streaming',
    accentColor: '#E5A00D',
    surfaceGradient: 'from-[#2B2009] via-[#1A150B] to-[#111318]',
    iconType: 'plex',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    subtitle: 'Música y podcasts',
    category: 'streaming',
    accentColor: '#1DB954',
    surfaceGradient: 'from-[#0B2917] via-[#0C1B12] to-[#111318]',
    iconType: 'spotify',
  },
  {
    id: 'twitch',
    name: 'Twitch',
    subtitle: 'Directos',
    category: 'streaming',
    accentColor: '#9146FF',
    surfaceGradient: 'from-[#22123A] via-[#150F24] to-[#111318]',
    iconType: 'twitch',
  },
  {
    id: 'pluto',
    name: 'Pluto TV',
    subtitle: 'Canales en abierto',
    category: 'streaming',
    accentColor: '#F5C518',
    surfaceGradient: 'from-[#29220A] via-[#19160B] to-[#111318]',
    iconType: 'pluto',
  },
  {
    id: 'vlc',
    name: 'VLC Media',
    subtitle: 'Reproductor USB y red',
    category: 'utilidades',
    accentColor: '#FF8800',
    surfaceGradient: 'from-[#2E1B08] via-[#1B130B] to-[#111318]',
    iconType: 'vlc',
  },
  {
    id: 'files',
    name: 'Archivos',
    subtitle: 'Explorador de almacenamiento',
    category: 'utilidades',
    accentColor: '#38BDF8',
    surfaceGradient: 'from-[#0E2533] via-[#0F1922] to-[#111318]',
    iconType: 'files',
  },
  {
    id: 'browser',
    name: 'Internet TV',
    subtitle: 'Navegador web rápido',
    category: 'utilidades',
    accentColor: '#14B8A6',
    surfaceGradient: 'from-[#0C2926] via-[#0D1A1A] to-[#111318]',
    iconType: 'browser',
  },
  {
    id: 'downloader',
    name: 'Downloader',
    subtitle: 'Instalador APK / Fire TV',
    category: 'utilidades',
    accentColor: '#F97316',
    surfaceGradient: 'from-[#2E160A] via-[#1B110C] to-[#111318]',
    iconType: 'downloader',
  },
  {
    id: 'cleaner',
    name: 'Turbo RAM',
    subtitle: 'Liberar memoria en segundo plano',
    category: 'utilidades',
    accentColor: '#34D399',
    surfaceGradient: 'from-[#0B2920] via-[#0C1B17] to-[#111318]',
    iconType: 'cleaner',
  },
  {
    id: 'firewall',
    name: 'Firewall TV',
    subtitle: 'Bloqueo de rastreadores y red',
    category: 'utilidades',
    accentColor: '#22D3EE',
    surfaceGradient: 'from-[#0B262C] via-[#0C181C] to-[#111318]',
    iconType: 'firewall',
  },
  {
    id: 'system_settings',
    name: 'Ajustes Sistema',
    subtitle: 'Red, pantalla y dispositivo',
    category: 'utilidades',
    accentColor: '#94A3B8',
    surfaceGradient: 'from-[#1C222D] via-[#141820] to-[#111318]',
    iconType: 'system_settings',
  },
  {
    id: 'xbox',
    name: 'Xbox Cloud',
    subtitle: 'Juegos en la nube',
    category: 'juegos',
    accentColor: '#107C10',
    surfaceGradient: 'from-[#0D2B10] via-[#0E1B0F] to-[#111318]',
    iconType: 'xbox',
  },
  {
    id: 'retroarch',
    name: 'RetroArch',
    subtitle: 'Emulación clásica',
    category: 'juegos',
    accentColor: '#E2E8F0',
    surfaceGradient: 'from-[#1F242D] via-[#14171D] to-[#111318]',
    iconType: 'retroarch',
  },
  {
    id: 'moonlight',
    name: 'Moonlight',
    subtitle: 'Streaming desde PC local',
    category: 'juegos',
    accentColor: '#3B82F6',
    surfaceGradient: 'from-[#10223D] via-[#0F1726] to-[#111318]',
    iconType: 'moonlight',
  },
  {
    id: 'steamlink',
    name: 'Steam Link',
    subtitle: 'Biblioteca en red local',
    category: 'juegos',
    accentColor: '#0EA5E9',
    surfaceGradient: 'from-[#0B2336] via-[#0C1722] to-[#111318]',
    iconType: 'steamlink',
  },
];

export const DEFAULT_PINNED_IDS = [
  'youtube',
  'vlc',
  'ytmusic',
  'netflix',
  'prime',
  'spotify',
  'vix',
  'xbox',
];

export const SECONDARY_PINNED_IDS = [
  'disney',
  'tubi',
  'pluto',
  'azteca',
  'kodi',
  'retroarch',
];

export const FEATURED_ITEMS: FeaturedItem[] = [
  {
    id: 'feat-1',
    title: 'Horizonte de Obsidiana',
    appName: 'Plex',
    appId: 'plex',
    meta: 'Película · 4K HDR · 42 min restantes',
    progressPercent: 64,
    backdropUrl: '/src/assets/images/hero_cinema_backdrop_1794690374096.jpg',
  },
  {
    id: 'feat-2',
    title: 'Arquitectura del Silencio',
    appName: 'YouTube',
    appId: 'youtube',
    meta: 'Documental · 2160p60 · Reproducido ayer',
    progressPercent: 38,
    backdropUrl: '/src/assets/images/wallpaper_alpine_dusk_1794690373682.jpg',
  },
];

export const HDMI_INPUTS: HdmiInput[] = [
  {
    id: 'hdmi-1',
    name: 'HDMI 1',
    sourceLabel: 'Fire TV Stick / Android Box',
    resolution: '3840 × 2160 · 60 Hz',
    connected: true,
    icon: 'tv',
  },
  {
    id: 'hdmi-2',
    name: 'HDMI 2',
    sourceLabel: 'Consola de Juegos',
    resolution: 'Sin señal activa',
    connected: false,
    icon: 'gamepad',
  },
  {
    id: 'hdmi-3',
    name: 'HDMI 3 · eARC',
    sourceLabel: 'Barra de Sonido',
    resolution: 'Dolby Digital Plus',
    connected: true,
    icon: 'speaker',
  },
  {
    id: 'usb-1',
    name: 'Puerto USB 3.0',
    sourceLabel: 'Memoria Externa Kingston',
    resolution: '112 GB disponibles',
    connected: true,
    icon: 'usb',
  },
];

export const DEFAULT_SETTINGS: LauncherSettings = {
  layoutPreset: 'tonalix_dock',
  iconShape: 'tonalix_square',
  wallpaper: 'emerald_mist',
  wallpaperBrightness: 65,
  accentColor: '#22D3EE',
  surfaceTint: '#0C1A20',
  ambientGlow: true,
  cardSize: 'standard',
  gridColumns: 5,
  showFeatured: true,
  showClock: true,
  showHints: true,
  soundEnabled: true,
  wifiConnected: true,
  bluetoothConnected: true,
  gameMode: false,
  autoSwitchGamesOnGameMode: true,
  firewallEnabled: true,
  bootAppId: null,
  isDefaultLauncher: true,
  oledProtector: true,
  oledPixelShift: true,
  quickBar: {
    showSearch: true,
    showTurboBoost: true,
    showWifi: true,
    showBluetooth: true,
    showGameMode: true,
    showDistanceInputs: true,
    showRamHealth: true,
    showFirewall: false,
    showShareQr: true,
    showVoiceCommand: true,
  },
  calibration: {
    autoOptimize: true,
    deviceProfile: 'xiaomi_box',
    tvInches: 55,
    viewingDistanceM: 2.6,
    resolution: '4k',
    panelType: 'oled',
    overscanPercent: 0,
    lowRamMode: true,
  },
  nightMode: {
    enabled: true,
    startTime: '21:00',
    endTime: '07:00',
    warmAccentColor: '#F59E0B',
    warmSurfaceTint: '#1F160C',
    nightBrightness: 25,
    warmFilterOpacity: 16,
    forcePreview: false,
  },
};

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-primary',
    name: 'Inicio Principal',
    roleLabel: 'Administrador · Sesión blindada',
    avatarColor: '#22D3EE',
    avatarIcon: 'home',
    pin: '1234',
    lockOnTvOff: true,
    data: {
      settings: DEFAULT_SETTINGS,
      pinnedIds: DEFAULT_PINNED_IDS,
      hiddenIds: [],
      customApps: [],
    },
  },
  {
    id: 'user-secondary',
    name: 'Sesión Privada / Sala',
    roleLabel: 'Perfil aislado · Fire TV',
    avatarColor: '#A78BFA',
    avatarIcon: 'shield',
    pin: '5678',
    lockOnTvOff: true,
    data: {
      settings: {
        ...DEFAULT_SETTINGS,
        layoutPreset: 'fire_tv',
        iconShape: 'banner_16_9',
        wallpaper: 'obsidian',
        accentColor: '#38BDF8',
        surfaceTint: '#0E1928',
        calibration: {
          ...DEFAULT_SETTINGS.calibration,
          deviceProfile: 'fire_tv_4k',
          lowRamMode: false,
        },
      },
      pinnedIds: SECONDARY_PINNED_IDS,
      hiddenIds: ['stremio', 'downloader'],
      customApps: [],
    },
  },
];
