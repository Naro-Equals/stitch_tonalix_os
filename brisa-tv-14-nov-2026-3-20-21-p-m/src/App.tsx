import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Gamepad2,
  HardDrive,
  Moon,
  Music2,
  Package,
  Play,
  QrCode,
  SlidersHorizontal,
  Speaker,
  Tv,
  Zap,
} from 'lucide-react';
import { ApkExportModal } from './components/ApkExportModal';
import { AppLaunchModal } from './components/AppLaunchModal';
import { AppOptionsModal } from './components/AppOptionsModal';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { FireTvGuideModal } from './components/FireTvGuideModal';
import { OledPixelShift } from './components/OledPixelShift';
import { ScreensaverOverlay } from './components/ScreensaverOverlay';
import { SearchOverlay } from './components/SearchOverlay';
import { SettingsDrawer } from './components/SettingsDrawer';
import { ShareQrModal } from './components/ShareQrModal';
import { TopBar } from './components/TopBar';
import { TvAppCard } from './components/TvAppCard';
import { UserLockScreen } from './components/UserLockScreen';
import { useVoiceCommands } from './hooks/useVoiceCommands';
import {
  DEFAULT_PINNED_IDS,
  DEFAULT_SETTINGS,
  DEFAULT_USERS,
  FEATURED_ITEMS,
  HDMI_INPUTS,
  INITIAL_APPS,
  LAYOUT_PRESETS,
  WALLPAPERS,
} from './data/tvApps';
import {
  AppCategory,
  DiagnosticReport,
  LauncherSettings,
  LauncherTab,
  LayoutPresetId,
  SharedLauncherConfig,
  TvApp,
  UserProfile,
} from './types/launcher';
import { readConfigFromUrl } from './utils/configShare';
import { isNightModeActive, runStartupDiagnostics } from './utils/diagnostics';
import { playNavTick, playSelectChime } from './utils/sound';
import { computeTvMetrics, DEVICE_PROFILES } from './utils/tvOptimizer';

const USERS_STORAGE_KEY = 'tonalix_tv_users_v3';
const SESSION_KEY = 'tonalix_tv_unlocked_user';
const PERSISTENT_AUTO_LOGIN_KEY = 'tonalix_tv_remembered_user';

function loadUsersFromStorage(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return DEFAULT_USERS;
    const parsed = JSON.parse(raw) as UserProfile[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_USERS;
    return parsed.map((u) => ({
      ...u,
      avatarIcon: u.avatarIcon ?? 'user',
      data: {
        ...u.data,
        settings: {
          ...DEFAULT_SETTINGS,
          ...(u.data?.settings ?? {}),
          oledProtector: u.data?.settings?.oledProtector ?? DEFAULT_SETTINGS.oledProtector,
          oledPixelShift: u.data?.settings?.oledPixelShift ?? DEFAULT_SETTINGS.oledPixelShift,
          quickBar: {
            ...DEFAULT_SETTINGS.quickBar,
            ...(u.data?.settings?.quickBar ?? {}),
          },
          calibration: {
            ...DEFAULT_SETTINGS.calibration,
            ...(u.data?.settings?.calibration ?? {}),
          },
          nightMode: {
            ...DEFAULT_SETTINGS.nightMode,
            ...(u.data?.settings?.nightMode ?? {}),
          },
        },
      },
    }));
  } catch {
    return DEFAULT_USERS;
  }
}

function getInitialUnlockedUserId(users: UserProfile[]): string | null {
  try {
    // If URL has ?cfg=, unlock primary user directly with imported config
    if (readConfigFromUrl()) {
      return users[0]?.id ?? null;
    }
    const sessionUserId = sessionStorage.getItem(SESSION_KEY);
    if (sessionUserId && users.some((u) => u.id === sessionUserId)) {
      return sessionUserId;
    }
    const rememberedId = localStorage.getItem(PERSISTENT_AUTO_LOGIN_KEY);
    if (rememberedId) {
      const target = users.find((u) => u.id === rememberedId);
      if (target && !target.lockOnTvOff) {
        return target.id;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

function getGridClass(columns: number): string {
  switch (columns) {
    case 3:
      return 'grid-cols-2 sm:grid-cols-3';
    case 4:
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
    case 6:
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
    case 5:
    default:
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
  }
}

export default function App() {
  const initialUsers = useMemo(() => {
    const loaded = loadUsersFromStorage();
    const urlCfg = readConfigFromUrl();
    if (urlCfg && loaded[0]) {
      loaded[0] = {
        ...loaded[0],
        data: {
          settings: {
            ...DEFAULT_SETTINGS,
            ...urlCfg.settings,
            quickBar: {
              ...DEFAULT_SETTINGS.quickBar,
              ...(urlCfg.settings.quickBar ?? {}),
            },
            calibration: {
              ...DEFAULT_SETTINGS.calibration,
              ...(urlCfg.settings.calibration ?? {}),
            },
          },
          pinnedIds: urlCfg.pinnedIds,
          hiddenIds: urlCfg.hiddenIds ?? [],
          customApps: urlCfg.customApps ?? [],
        },
      };
    }
    return loaded;
  }, []);

  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [activeUserId, setActiveUserId] = useState<string | null>(() =>
    getInitialUnlockedUserId(initialUsers),
  );
  const [tvPoweredOff, setTvPoweredOff] = useState(false);
  const [showImportNotice, setShowImportNotice] = useState(() => Boolean(readConfigFromUrl()));

  const [activeTab, setActiveTab] = useState<LauncherTab>('inicio');
  const [categoryFilter, setCategoryFilter] = useState<'todas' | AppCategory>('todas');
  const [sidebarFilter, setSidebarFilter] = useState<'favoritos' | 'todas' | AppCategory>('favoritos');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [activeInputId, setActiveInputId] = useState<string>('hdmi-1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ramUsedMb, setRamUsedMb] = useState(386);

  const [focusPos, setFocusPos] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [focusedAppId, setFocusedAppId] = useState<string>('youtube');

  const [launchedApp, setLaunchedApp] = useState<TvApp | null>(null);
  const [optionsApp, setOptionsApp] = useState<TvApp | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareQrOpen, setIsShareQrOpen] = useState(false);
  const [isScreensaverOpen, setIsScreensaverOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isApkExportOpen, setIsApkExportOpen] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [fireTvModalMode, setFireTvModalMode] = useState<'sideload' | 'firewall' | null>(null);
  const [sleepEndTimestamp, setSleepEndTimestamp] = useState<number | null>(null);
  const [sleepMinutesLeft, setSleepMinutesLeft] = useState<number | null>(null);
  const [zenTime, setZenTime] = useState(() => new Date());

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const executeDiagnostics = useCallback(async () => {
    setDiagnosticsRunning(true);
    try {
      const report = await runStartupDiagnostics();
      setDiagnosticReport(report);
    } finally {
      setDiagnosticsRunning(false);
    }
  }, []);

  // Run automatic startup diagnostics on app launch
  useEffect(() => {
    executeDiagnostics();
  }, [executeDiagnostics]);

  // Persist all isolated user profiles
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // Ignore quota errors
    }
  }, [users]);

  // Active user reference (safe fallback to first user for hooks)
  const activeUser = useMemo(
    () => users.find((u) => u.id === activeUserId) ?? users[0],
    [users, activeUserId],
  );

  const settings = activeUser.data.settings;
  const pinnedIds = activeUser.data.pinnedIds;
  const hiddenIds = activeUser.data.hiddenIds;
  const customApps = activeUser.data.customApps;

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  }, []);

  const updateActiveUserData = useCallback(
    (updater: (prev: UserProfile['data']) => UserProfile['data']) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === activeUser.id ? { ...u, data: updater(u.data) } : u)),
      );
    },
    [activeUser.id],
  );

  const updateSettings = useCallback(
    (patch: Partial<LauncherSettings>) => {
      updateActiveUserData((data) => ({
        ...data,
        settings: { ...data.settings, ...patch },
      }));
    },
    [updateActiveUserData],
  );

  // Clock & Sleep timer
  useEffect(() => {
    const timer = setInterval(() => setZenTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!sleepEndTimestamp) {
      setSleepMinutesLeft(null);
      return;
    }
    const updateTimer = () => {
      const diffMs = sleepEndTimestamp - Date.now();
      if (diffMs <= 0) {
        setSleepEndTimestamp(null);
        setSleepMinutesLeft(null);
        setIsScreensaverOpen(true);
      } else {
        setSleepMinutesLeft(Math.ceil(diffMs / 60000));
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 15000);
    return () => clearInterval(interval);
  }, [sleepEndTimestamp]);

  const handleSetSleepTimer = useCallback((minutes: number | null) => {
    if (minutes === null) {
      setSleepEndTimestamp(null);
      setSleepMinutesLeft(null);
    } else {
      setSleepEndTimestamp(Date.now() + minutes * 60 * 1000);
      setSleepMinutesLeft(minutes);
    }
  }, []);

  // Device + TV Auto-optimization calculations
  const tvMetrics = useMemo(
    () => computeTvMetrics(settings.calibration),
    [settings.calibration],
  );
  const deviceSpec =
    DEVICE_PROFILES[settings.calibration.deviceProfile] ?? DEVICE_PROFILES.xiaomi_box;

  const effectiveCardSize = settings.calibration.autoOptimize
    ? tvMetrics.cardSize
    : settings.cardSize;
  const effectiveColumns = settings.calibration.autoOptimize
    ? tvMetrics.columns
    : settings.gridColumns;
  const effectiveIconShape = settings.iconShape;
  const effectiveScale = settings.calibration.autoOptimize ? tvMetrics.uiScale : 1;
  const reduceMotion = settings.calibration.lowRamMode || tvMetrics.reduceMotion;

  const allApps = useMemo(() => [...INITIAL_APPS, ...customApps], [customApps]);
  const visibleApps = useMemo(
    () => allApps.filter((app) => !hiddenIds.includes(app.id)),
    [allApps, hiddenIds],
  );
  const hiddenApps = useMemo(
    () => allApps.filter((app) => hiddenIds.includes(app.id)),
    [allApps, hiddenIds],
  );

  const pinnedApps = useMemo(() => {
    const map = new Map(visibleApps.map((a) => [a.id, a]));
    return pinnedIds.map((id) => map.get(id)).filter((a): a is TvApp => Boolean(a));
  }, [visibleApps, pinnedIds]);

  const gameApps = useMemo(
    () => visibleApps.filter((a) => a.category === 'juegos'),
    [visibleApps],
  );

  // Tonalix Dock auto-switches to games if Game Mode + autoSwitchGamesOnGameMode is enabled
  const activeDockApps = useMemo(() => {
    if (settings.gameMode && settings.autoSwitchGamesOnGameMode && gameApps.length > 0) {
      return gameApps;
    }
    return pinnedApps;
  }, [settings.gameMode, settings.autoSwitchGamesOnGameMode, gameApps, pinnedApps]);

  const homeRows = useMemo(() => {
    if (settings.layoutPreset === 'solo_apps') {
      return [
        {
          id: 'todas_grid',
          title: 'Aplicaciones',
          apps: [...pinnedApps, ...visibleApps.filter((a) => !pinnedIds.includes(a.id))],
        },
      ];
    }
    if (settings.layoutPreset === 'tonalix_dock' || settings.layoutPreset === 'dock_zen') {
      return [
        {
          id: 'dock',
          title:
            settings.gameMode && settings.autoSwitchGamesOnGameMode
              ? 'Dock Gamer · Emuladores y Juegos'
              : 'Dock de Accesos Rápidos',
          apps: activeDockApps,
        },
      ];
    }
    if (settings.layoutPreset === 'bento_cinema') {
      return [
        {
          id: 'resto',
          title: 'Explorar aplicaciones',
          apps: visibleApps.filter((a) => !pinnedIds.slice(0, 4).includes(a.id)),
        },
      ];
    }
    if (settings.layoutPreset === 'fire_tv') {
      return [
        { id: 'favoritos', title: 'Tus aplicaciones', apps: activeDockApps },
        {
          id: 'streaming',
          title: 'Streaming y TV en vivo',
          apps: visibleApps.filter((a) => a.category === 'streaming'),
        },
        {
          id: 'juegos',
          title: 'Juegos y nube',
          apps: visibleApps.filter((a) => a.category === 'juegos'),
        },
        {
          id: 'utilidades',
          title: 'Herramientas Fire TV / Box',
          apps: visibleApps.filter((a) => a.category === 'utilidades'),
        },
      ].filter((r) => r.apps.length > 0);
    }
    return [
      { id: 'favoritos', title: 'Favoritos', apps: activeDockApps },
      {
        id: 'streaming',
        title: 'Streaming y multimedia',
        apps: visibleApps.filter((a) => a.category === 'streaming'),
      },
      {
        id: 'utilidades',
        title: 'Herramientas TV Box',
        apps: visibleApps.filter((a) => a.category === 'utilidades'),
      },
      {
        id: 'juegos',
        title: 'Juegos y streaming PC',
        apps: visibleApps.filter((a) => a.category === 'juegos'),
      },
    ].filter((r) => r.apps.length > 0);
  }, [
    settings.layoutPreset,
    settings.gameMode,
    settings.autoSwitchGamesOnGameMode,
    pinnedApps,
    visibleApps,
    pinnedIds,
    activeDockApps,
  ]);

  const sidebarApps = useMemo(() => {
    if (sidebarFilter === 'favoritos') return activeDockApps;
    if (sidebarFilter === 'todas') return visibleApps;
    return visibleApps.filter((a) => a.category === sidebarFilter);
  }, [sidebarFilter, activeDockApps, visibleApps]);

  const filteredGridApps = useMemo(() => {
    if (categoryFilter === 'todas') return visibleApps;
    return visibleApps.filter((a) => a.category === categoryFilter);
  }, [visibleApps, categoryFilter]);

  const focusedApp = useMemo(
    () => visibleApps.find((a) => a.id === focusedAppId) ?? visibleApps[0] ?? null,
    [visibleApps, focusedAppId],
  );

  const activeWallpaper = WALLPAPERS[settings.wallpaper] ?? WALLPAPERS.emerald_mist;
  const activeFeatured = FEATURED_ITEMS[featuredIndex % FEATURED_ITEMS.length];

  const shareableConfig: SharedLauncherConfig = useMemo(
    () => ({
      v: 1,
      settings,
      pinnedIds,
      hiddenIds,
      customApps,
    }),
    [settings, pinnedIds, hiddenIds, customApps],
  );

  // Session Unlock / Lock / Power-Off TV Handlers
  const handleUnlockUser = useCallback(
    (userId: string) => {
      const targetUser = users.find((u) => u.id === userId);
      if (!targetUser) return;
      setActiveUserId(userId);
      setTvPoweredOff(false);
      setFocusPos({ row: 0, col: 0 });
      try {
        sessionStorage.setItem(SESSION_KEY, userId);
        if (!targetUser.lockOnTvOff) {
          localStorage.setItem(PERSISTENT_AUTO_LOGIN_KEY, userId);
        } else {
          localStorage.removeItem(PERSISTENT_AUTO_LOGIN_KEY);
        }
      } catch {
        // Ignore storage errors
      }
      // Check Boot App on Startup
      if (targetUser.data.settings.bootAppId) {
        const bootApp = INITIAL_APPS.concat(targetUser.data.customApps).find(
          (a) => a.id === targetUser.data.settings.bootAppId,
        );
        if (bootApp) {
          setLaunchedApp(bootApp);
        }
      }
    },
    [users],
  );

  const handleLockSession = useCallback(() => {
    setActiveUserId(null);
    setLaunchedApp(null);
    setIsSettingsOpen(false);
    setIsSearchOpen(false);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const handlePowerOffTv = useCallback(() => {
    setActiveUserId(null);
    setLaunchedApp(null);
    setIsSettingsOpen(false);
    setIsSearchOpen(false);
    setTvPoweredOff(true);
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(PERSISTENT_AUTO_LOGIN_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const handleTurboBoost = useCallback(() => {
    playSelectChime(settings.soundEnabled);
    const optimizedMb = Math.max(195, tvMetrics.ramBudgetMb - 60);
    setRamUsedMb(optimizedMb);
    showToast(`Turbo Boost: RAM optimizada a ${optimizedMb} MB en ${deviceSpec.shortLabel}`);
  }, [settings.soundEnabled, tvMetrics.ramBudgetMb, deviceSpec.shortLabel, showToast]);

  const handleLaunchApp = useCallback(
    (app: TvApp) => {
      playSelectChime(settings.soundEnabled);
      if (app.id === 'firewall') {
        setFireTvModalMode('firewall');
        return;
      }
      setLaunchedApp(app);
    },
    [settings.soundEnabled],
  );

  const voice = useVoiceCommands({
    enabled: settings.quickBar.showVoiceCommand !== false,
    apps: visibleApps,
    onLaunchApp: handleLaunchApp,
    onStatus: showToast,
  });

  const handleResumeFeatured = useCallback(() => {
    const targetApp = visibleApps.find((a) => a.id === activeFeatured.appId) ?? visibleApps[0];
    if (targetApp) handleLaunchApp(targetApp);
  }, [visibleApps, activeFeatured, handleLaunchApp]);

  const handleTogglePin = useCallback(
    (appId: string) => {
      updateActiveUserData((data) => ({
        ...data,
        pinnedIds: data.pinnedIds.includes(appId)
          ? data.pinnedIds.filter((id) => id !== appId)
          : [...data.pinnedIds, appId],
      }));
    },
    [updateActiveUserData],
  );

  const handleMovePinned = useCallback(
    (appId: string, direction: 'left' | 'right') => {
      updateActiveUserData((data) => {
        const idx = data.pinnedIds.indexOf(appId);
        if (idx === -1) return data;
        const target = direction === 'left' ? idx - 1 : idx + 1;
        if (target < 0 || target >= data.pinnedIds.length) return data;
        const copy = [...data.pinnedIds];
        [copy[idx], copy[target]] = [copy[target], copy[idx]];
        return { ...data, pinnedIds: copy };
      });
    },
    [updateActiveUserData],
  );

  const handleHideApp = useCallback(
    (appId: string) => {
      updateActiveUserData((data) => ({
        ...data,
        hiddenIds: data.hiddenIds.includes(appId) ? data.hiddenIds : [...data.hiddenIds, appId],
      }));
    },
    [updateActiveUserData],
  );

  const handleRestoreApp = useCallback(
    (appId: string) => {
      updateActiveUserData((data) => ({
        ...data,
        hiddenIds: data.hiddenIds.filter((id) => id !== appId),
      }));
    },
    [updateActiveUserData],
  );

  const handleAddCustomApp = useCallback(
    (name: string, category: AppCategory, accentColor: string, customUrl?: string) => {
      const id = `custom-${Date.now()}`;
      const newApp: TvApp = {
        id,
        name,
        subtitle: customUrl ? 'Enlace web TV' : 'Acceso directo personalizado',
        category,
        accentColor,
        surfaceGradient: 'from-[#182030] via-[#121622] to-[#0E1118]',
        iconType: 'custom',
        isCustom: true,
        customUrl,
      };
      updateActiveUserData((data) => ({
        ...data,
        customApps: [...data.customApps, newApp],
        pinnedIds: [id, ...data.pinnedIds],
      }));
    },
    [updateActiveUserData],
  );

  const handleImportConfig = useCallback(
    (imported: SharedLauncherConfig) => {
      updateActiveUserData(() => ({
        settings: {
          ...DEFAULT_SETTINGS,
          ...imported.settings,
          quickBar: {
            ...DEFAULT_SETTINGS.quickBar,
            ...(imported.settings.quickBar ?? {}),
          },
          calibration: {
            ...DEFAULT_SETTINGS.calibration,
            ...(imported.settings.calibration ?? {}),
          },
        },
        pinnedIds: imported.pinnedIds,
        hiddenIds: imported.hiddenIds ?? [],
        customApps: imported.customApps ?? [],
      }));
      setShowImportNotice(true);
    },
    [updateActiveUserData],
  );

  const handleUpdateActiveUserMeta = useCallback(
    (patch: Partial<Pick<UserProfile, 'name' | 'pin' | 'lockOnTvOff' | 'avatarColor'>>) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === activeUser.id ? { ...u, ...patch } : u)),
      );
      showToast('Perfil de usuario actualizado');
    },
    [activeUser.id, showToast],
  );

  const handleCreateUser = useCallback(
    (name: string, pin: string) => {
      const palette = ['#34D399', '#FBBF24', '#FB7185', '#38BDF8'];
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name,
        roleLabel: 'Sesión independiente',
        avatarColor: palette[users.length % palette.length],
        pin,
        lockOnTvOff: true,
        data: {
          settings: DEFAULT_SETTINGS,
          pinnedIds: DEFAULT_PINNED_IDS,
          hiddenIds: [],
          customApps: [],
        },
      };
      setUsers((prev) => [...prev, newUser]);
      showToast(`Usuario «${name}» creado y blindado`);
    },
    [users.length, showToast],
  );

  const handleResetUserDefaults = useCallback(() => {
    updateActiveUserData(() => ({
      settings: DEFAULT_SETTINGS,
      pinnedIds: DEFAULT_PINNED_IDS,
      hiddenIds: [],
      customApps: [],
    }));
  }, [updateActiveUserData]);

  const handleSelectInput = useCallback(
    (inputId: string, label: string) => {
      playSelectChime(settings.soundEnabled);
      setActiveInputId(inputId);
      showToast(`Entrada seleccionada: ${label}`);
    },
    [settings.soundEnabled, showToast],
  );

  // Scroll focused card smoothly into view
  useEffect(() => {
    if (!activeUserId || activeTab !== 'inicio' || focusPos.row < 0) return;
    if (settings.layoutPreset === 'solo_apps' || settings.layoutPreset === 'sidebar_pro') return;
    const row = homeRows[focusPos.row];
    const app = row?.apps[focusPos.col];
    if (!app) return;
    setFocusedAppId(app.id);
    const key = `${row.id}:${app.id}`;
    const el = cardRefs.current[key];
    if (el) {
      el.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeUserId, focusPos, activeTab, homeRows, settings.layoutPreset, reduceMotion]);

  // Global D-Pad Navigation when session is unlocked
  useEffect(() => {
    if (!activeUserId || tvPoweredOff) return;
    const anyOverlayOpen =
      Boolean(launchedApp) ||
      Boolean(optionsApp) ||
      Boolean(fireTvModalMode) ||
      isSearchOpen ||
      isSettingsOpen ||
      isShareQrOpen ||
      isScreensaverOpen ||
      isDiagnosticsOpen ||
      isApkExportOpen;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (anyOverlayOpen) return;
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      const activeGridApps =
        activeTab === 'aplicaciones'
          ? filteredGridApps
          : settings.layoutPreset === 'solo_apps'
            ? homeRows[0]?.apps ?? []
            : settings.layoutPreset === 'sidebar_pro'
              ? sidebarApps
              : null;

      const hasHero =
        activeTab === 'inicio' &&
        (settings.layoutPreset === 'leanback' ||
          settings.layoutPreset === 'fire_tv' ||
          settings.layoutPreset === 'bento_cinema') &&
        settings.showFeatured;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        playNavTick(settings.soundEnabled);
        if (focusPos.row === -1) {
          setFocusPos({ row: -1, col: Math.min(2, focusPos.col + 1) });
        } else if (focusPos.row === -2) {
          setFeaturedIndex((i) => (i + 1) % FEATURED_ITEMS.length);
        } else if (activeGridApps) {
          setFocusPos((prev) => ({
            row: 0,
            col: Math.min(activeGridApps.length - 1, prev.col + 1),
          }));
        } else if (activeTab === 'inicio') {
          const row = homeRows[focusPos.row];
          if (row) {
            setFocusPos({ row: focusPos.row, col: Math.min(row.apps.length - 1, focusPos.col + 1) });
          }
        } else if (activeTab === 'entradas') {
          setFocusPos((prev) => ({
            row: 0,
            col: Math.min(HDMI_INPUTS.length - 1, prev.col + 1),
          }));
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        playNavTick(settings.soundEnabled);
        if (focusPos.row === -1) {
          setFocusPos({ row: -1, col: Math.max(0, focusPos.col - 1) });
        } else if (focusPos.row === -2) {
          setFeaturedIndex((i) => (i - 1 + FEATURED_ITEMS.length) % FEATURED_ITEMS.length);
        } else {
          setFocusPos((prev) => ({ row: prev.row, col: Math.max(0, prev.col - 1) }));
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        playNavTick(settings.soundEnabled);
        if (focusPos.row === -1) {
          setFocusPos({ row: hasHero ? -2 : 0, col: 0 });
        } else if (focusPos.row === -2) {
          setFocusPos({ row: 0, col: 0 });
        } else if (activeGridApps) {
          setFocusPos((prev) => ({
            row: 0,
            col: Math.min(activeGridApps.length - 1, prev.col + effectiveColumns),
          }));
        } else if (activeTab === 'inicio') {
          const nextRow = Math.min(homeRows.length - 1, focusPos.row + 1);
          const targetLen = homeRows[nextRow]?.apps.length ?? 1;
          setFocusPos({ row: nextRow, col: Math.min(focusPos.col, targetLen - 1) });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        playNavTick(settings.soundEnabled);
        if (activeGridApps && focusPos.row === 0 && focusPos.col >= effectiveColumns) {
          setFocusPos((prev) => ({ row: 0, col: prev.col - effectiveColumns }));
        } else if (focusPos.row === 0) {
          setFocusPos({ row: hasHero ? -2 : -1, col: 0 });
        } else if (focusPos.row === -2) {
          setFocusPos({ row: -1, col: 0 });
        } else if (focusPos.row > 0) {
          const prevRow = focusPos.row - 1;
          const targetLen = homeRows[prevRow]?.apps.length ?? 1;
          setFocusPos({ row: prevRow, col: Math.min(focusPos.col, targetLen - 1) });
        }
      } else if (e.key === 'Enter') {
        if (focusPos.row === -1) {
          e.preventDefault();
          if (focusPos.col === 0) setActiveTab('inicio');
          if (focusPos.col === 1) setActiveTab('aplicaciones');
          if (focusPos.col === 2) setActiveTab('entradas');
        } else if (focusPos.row === -2) {
          e.preventDefault();
          handleResumeFeatured();
        } else if (activeGridApps) {
          const app = activeGridApps[focusPos.col];
          if (app) {
            e.preventDefault();
            handleLaunchApp(app);
          }
        } else if (activeTab === 'inicio') {
          const app = homeRows[focusPos.row]?.apps[focusPos.col];
          if (app) {
            e.preventDefault();
            handleLaunchApp(app);
          }
        } else if (activeTab === 'entradas') {
          const input = HDMI_INPUTS[focusPos.col];
          if (input) {
            e.preventDefault();
            handleSelectInput(input.id, `${input.name} · ${input.sourceLabel}`);
          }
        }
      } else if ((e.key === 'm' || e.key === 'M') && focusPos.row >= 0) {
        const target = activeGridApps
          ? activeGridApps[focusPos.col]
          : homeRows[focusPos.row]?.apps[focusPos.col];
        if (target) {
          e.preventDefault();
          setOptionsApp(target);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeUserId,
    tvPoweredOff,
    launchedApp,
    optionsApp,
    fireTvModalMode,
    isSearchOpen,
    isSettingsOpen,
    isShareQrOpen,
    isScreensaverOpen,
    isDiagnosticsOpen,
    isApkExportOpen,
    activeTab,
    settings.layoutPreset,
    settings.showFeatured,
    settings.soundEnabled,
    focusPos,
    homeRows,
    filteredGridApps,
    sidebarApps,
    effectiveColumns,
    handleLaunchApp,
    handleResumeFeatured,
    handleSelectInput,
  ]);

  // If TV is powered off or no user session is unlocked, show the isolated User Lock Screen!
  if (!activeUserId || tvPoweredOff) {
    return (
      <UserLockScreen
        users={users}
        tvPoweredOff={tvPoweredOff}
        onPowerOn={() => setTvPoweredOff(false)}
        onUnlockUser={handleUnlockUser}
      />
    );
  }

  const handleSelectTab = (tab: LauncherTab) => {
    playNavTick(settings.soundEnabled);
    setActiveTab(tab);
    setFocusPos({ row: 0, col: 0 });
  };

  const handleSwitchLayout = (presetId: LayoutPresetId) => {
    playNavTick(settings.soundEnabled);
    updateSettings({
      layoutPreset: presetId,
      iconShape: presetId === 'tonalix_dock' ? 'tonalix_square' : settings.iconShape,
    });
    setFocusPos({ row: 0, col: 0 });
  };

  const overscanStyle: React.CSSProperties = {
    padding: `${settings.calibration.overscanPercent}%`,
    fontSize: `${Math.round(effectiveScale * 100)}%`,
  };

  const zenClockStr = zenTime.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const zenDateStr = zenTime.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const isNightActive = isNightModeActive(settings.nightMode, zenTime);
  const effectiveAccentColor = isNightActive
    ? settings.nightMode.warmAccentColor
    : settings.accentColor;
  const effectiveWallpaperBrightness = isNightActive
    ? Math.min(settings.wallpaperBrightness, settings.nightMode.nightBrightness)
    : settings.wallpaperBrightness;

  return (
    <OledPixelShift
      enabled={settings.oledProtector && settings.oledPixelShift && !reduceMotion}
      className={`relative min-h-screen w-full overflow-x-hidden ${activeWallpaper.bgClass} text-[#F4F6FA] transition-[padding] duration-200`}
    >
    <div style={overscanStyle} className="relative min-h-screen w-full">
      {/* Background Wallpaper Layer */}
      {activeWallpaper.imageUrl && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
          <img
            src={activeWallpaper.imageUrl}
            alt=""
            referrerPolicy="no-referrer"
            style={{ opacity: effectiveWallpaperBrightness / 100 }}
            className="h-full w-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#090B10]/70 via-[#090B10]/55 to-[#090B10]/95" />
        </div>
      )}

      {/* Programmable Night Mode Warm Amber Filter Veil */}
      {isNightActive && settings.nightMode.warmFilterOpacity > 0 && (
        <div
          aria-hidden="true"
          style={{ opacity: settings.nightMode.warmFilterOpacity / 100 }}
          className="pointer-events-none fixed inset-0 z-30 bg-[#B45309] mix-blend-multiply transition-opacity duration-500"
        />
      )}

      {/* Subtle Ambient App-Color Halo */}
      {focusedApp && settings.ambientGlow && !reduceMotion && settings.wallpaper !== 'oled' && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed -top-32 left-1/3 z-0 h-[420px] w-[620px] rounded-full opacity-[0.12] blur-[140px] transition-colors duration-500"
          style={{ backgroundColor: isNightActive ? effectiveAccentColor : focusedApp.accentColor }}
        />
      )}

      {/* Main Content Shell */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <TopBar
          activeTab={activeTab}
          settings={settings}
          activeUser={activeUser}
          ramUsedMb={ramUsedMb}
          ramBudgetMb={tvMetrics.ramBudgetMb}
          isNightActive={isNightActive}
          onSelectTab={handleSelectTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          onTurboBoost={handleTurboBoost}
          onToggleWifi={() => {
            updateSettings({ wifiConnected: !settings.wifiConnected });
            showToast(settings.wifiConnected ? 'Wi-Fi desconectado' : 'Wi-Fi 5 GHz conectado');
          }}
          onToggleBluetooth={() => {
            updateSettings({ bluetoothConnected: !settings.bluetoothConnected });
            showToast(
              settings.bluetoothConnected ? 'Bluetooth desactivado' : 'Bluetooth activado',
            );
          }}
          onToggleGameMode={() => {
            const next = !settings.gameMode;
            updateSettings({ gameMode: next });
            showToast(next ? 'Modo Juego activado' : 'Modo Juego desactivado');
          }}
          onOpenFirewall={() => setFireTvModalMode('firewall')}
          onOpenShareQr={() => setIsShareQrOpen(true)}
          onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLockSession={handleLockSession}
          onPowerOffTv={handlePowerOffTv}
          onVoiceCommand={() => voice.toggleListening()}
          voiceListening={voice.listening}
          focusedHeaderIndex={focusPos.row === -1 ? focusPos.col : null}
        />

        {/* Shared URL Import Notice */}
        {showImportNotice && (
          <div className="mx-6 mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-2.5 text-xs md:mx-12">
            <span className="text-white">
              Configuración cargada desde enlace compartido en el perfil «{activeUser.name}».
            </span>
            <button
              type="button"
              onClick={() => {
                setShowImportNotice(false);
                if (window.location.search.includes('cfg=')) {
                  window.history.replaceState({}, '', window.location.pathname);
                }
              }}
              className="font-semibold text-white underline underline-offset-2 hover:text-white/80 cursor-pointer"
            >
              Entendido
            </button>
          </div>
        )}

        <main className="flex flex-1 flex-col px-6 pb-8 pt-1 md:px-12">
          {/* TAB 1: INICIO */}
          {activeTab === 'inicio' && (
            <div className="flex flex-1 flex-col space-y-6">
              {/* Quick Design Switcher & Device Optimization Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {LAYOUT_PRESETS.map((preset) => {
                    const active = settings.layoutPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSwitchLayout(preset.id)}
                        style={
                          active
                            ? { backgroundColor: effectiveAccentColor, color: '#0B0D12' }
                            : undefined
                        }
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          active
                            ? 'font-semibold shadow-sm'
                            : 'text-white/60 hover:bg-white/[0.07] hover:text-white'
                        }`}
                      >
                        {preset.name}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                  {isNightActive && (
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(true)}
                      className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Moon className="h-3.5 w-3.5" />
                      Modo Noche cálido
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsDiagnosticsOpen(true)}
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Activity className="h-3.5 w-3.5 text-emerald-300" />
                    <span className="font-mono-tabular">
                      {diagnosticReport
                        ? `CPU ${diagnosticReport.cpuResponseMs}ms · Red ${diagnosticReport.networkLatencyMs ?? '—'}ms`
                        : 'Autodiagnóstico'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span className="font-mono-tabular">
                      {deviceSpec.shortLabel} · {settings.calibration.tvInches}&quot;
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsShareQrOpen(true)}
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsApkExportOpen(true)}
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Package className="h-3.5 w-3.5" />
                    APK / TV
                  </button>
                </div>
              </div>

              {/* DESIGN 1: TONALIX DOCK (Screenshot 2 Ultra-Light Style) */}
              {settings.layoutPreset === 'tonalix_dock' && (
                <div className="flex flex-1 flex-col justify-between gap-8 py-2">
                  {/* Top Info Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-lg sm:text-xl font-medium capitalize text-white/85">
                        {zenDateStr}
                      </p>
                      <p className="mt-0.5 text-xs text-white/50">
                        {deviceSpec.name} ·{' '}
                        {reduceMotion ? 'Modo Turbo Light activo' : 'Aceleración gráfica 60fps'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleTurboBoost}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white/85 hover:bg-white/10 cursor-pointer"
                      >
                        <Zap className="h-3.5 w-3.5 text-emerald-300" />
                        <span className="font-mono-tabular">
                          RAM: {ramUsedMb} MB · TURBO LIGHT
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Spotlight + Dock */}
                  <div className="space-y-4 mt-auto">
                    {settings.showFeatured && (
                      <div
                        style={{ backgroundColor: `${settings.surfaceTint}CC` }}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 px-5 py-4 backdrop-blur-md"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10"
                            style={{ color: effectiveAccentColor }}
                          >
                            <Music2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-display text-sm sm:text-base font-semibold text-white truncate">
                              {settings.gameMode
                                ? 'Modo Juego · Emuladores y Cloud Gaming listos'
                                : `Google TV · ${activeFeatured.appName}, YouTube y Streaming Destacados`}
                            </div>
                            <div className="text-xs text-white/55 truncate">
                              {settings.gameMode
                                ? 'Baja latencia y dock optimizado para mando Bluetooth'
                                : `${activeFeatured.title} · ${activeFeatured.meta}`}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleResumeFeatured}
                          style={{
                            borderColor: `${effectiveAccentColor}66`,
                            color: effectiveAccentColor,
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border bg-white/[0.04] px-4 py-2 text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          Abrir
                        </button>
                      </div>
                    )}

                    {/* Tonalix Dock Container */}
                    <section
                      aria-label={homeRows[0]?.title ?? 'Dock'}
                      style={{ backgroundColor: `${settings.surfaceTint}B3` }}
                      className="rounded-3xl border border-white/10 px-5 py-5 backdrop-blur-md"
                    >
                      <div className="no-scrollbar flex gap-5 overflow-x-auto py-1">
                        {(homeRows[0]?.apps ?? []).map((app, colIdx) => (
                          <TvAppCard
                            key={`tonalix-${app.id}`}
                            app={app}
                            isFocused={focusPos.row === 0 && focusPos.col === colIdx}
                            cardSize={effectiveCardSize}
                            iconShape={effectiveIconShape}
                            focusAccentColor={effectiveAccentColor}
                            reduceMotion={reduceMotion}
                            layout="row"
                            onFocus={() => {
                              setFocusPos({ row: 0, col: colIdx });
                              setFocusedAppId(app.id);
                            }}
                            onLaunch={handleLaunchApp}
                            onOpenOptions={setOptionsApp}
                            cardRef={(el) => {
                              cardRefs.current[`dock:${app.id}`] = el;
                            }}
                          />
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* DESIGN 2: AMAZON FIRE TV STICK (Screenshot 1 Style) */}
              {settings.layoutPreset === 'fire_tv' && (
                <div className="space-y-6">
                  {settings.showFeatured && (
                    <section aria-label="Destacado Fire TV">
                      <div
                        style={
                          focusPos.row === -2
                            ? { boxShadow: `0 0 0 2.5px ${effectiveAccentColor}` }
                            : undefined
                        }
                        className="relative overflow-hidden rounded-2xl ring-1 ring-white/12"
                      >
                        <div className="relative h-[220px] sm:h-[260px] w-full bg-[#101520]">
                          <img
                            src={activeFeatured.backdropUrl}
                            alt={activeFeatured.title}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-[#090B10]/95 via-[#090B10]/65 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#090B10]/90 via-transparent to-transparent" />

                          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 max-w-xl">
                            <p className="text-xs font-medium text-white/75 mb-1">
                              Fire TV · Ahora en streaming en {activeFeatured.appName}
                            </p>
                            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white [text-wrap:balance]">
                              {activeFeatured.title}
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-white/70">
                              {activeFeatured.meta}
                            </p>
                            <div className="mt-4 flex items-center gap-3">
                              <button
                                type="button"
                                onClick={handleResumeFeatured}
                                style={{ backgroundColor: effectiveAccentColor, color: '#0B0D12' }}
                                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90 cursor-pointer"
                              >
                                <Play className="h-4 w-4 fill-current" />
                                Más información
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setFeaturedIndex((i) => (i + 1) % FEATURED_ITEMS.length)
                                }
                                className="rounded-xl bg-white/15 px-3.5 py-2.5 text-xs font-medium text-white hover:bg-white/25 cursor-pointer"
                              >
                                Siguiente
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {homeRows.map((row, rowIdx) => (
                    <section key={row.id} aria-label={row.title} className="space-y-2.5">
                      <h2 className="font-display text-sm sm:text-base font-semibold text-white/90">
                        {row.title}
                      </h2>
                      <div className="no-scrollbar -mx-3 flex gap-4 overflow-x-auto px-3 py-2.5">
                        {row.apps.map((app, colIdx) => (
                          <TvAppCard
                            key={`fire-${row.id}-${app.id}`}
                            app={app}
                            isFocused={focusPos.row === rowIdx && focusPos.col === colIdx}
                            cardSize={rowIdx === 0 ? 'compact' : effectiveCardSize}
                            iconShape="banner_16_9"
                            focusAccentColor={effectiveAccentColor}
                            reduceMotion={reduceMotion}
                            layout="row"
                            onFocus={() => {
                              setFocusPos({ row: rowIdx, col: colIdx });
                              setFocusedAppId(app.id);
                            }}
                            onLaunch={handleLaunchApp}
                            onOpenOptions={setOptionsApp}
                            cardRef={(el) => {
                              cardRefs.current[`${row.id}:${app.id}`] = el;
                            }}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}

              {/* DESIGN 3: ANDROID TV CLÁSICO (LEANBACK) */}
              {settings.layoutPreset === 'leanback' && (
                <div className="space-y-8">
                  {settings.showFeatured && (
                    <section aria-label="Continuar viendo">
                      <div
                        style={
                          focusPos.row === -2
                            ? { boxShadow: `0 0 0 2.5px ${effectiveAccentColor}` }
                            : undefined
                        }
                        className="relative overflow-hidden rounded-2xl ring-1 ring-white/10"
                      >
                        <div className="relative h-[220px] sm:h-[256px] w-full bg-[#121620]">
                          <img
                            src={activeFeatured.backdropUrl}
                            alt={activeFeatured.title}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-[#090B10]/95 via-[#090B10]/70 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#090B10]/85 via-transparent to-transparent" />

                          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 max-w-xl">
                            <p className="text-xs font-medium text-white/70 mb-1.5">
                              Continuar en {activeFeatured.appName}
                            </p>
                            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white [text-wrap:balance]">
                              {activeFeatured.title}
                            </h1>
                            <p className="mt-1.5 text-xs sm:text-sm text-white/70">
                              {activeFeatured.meta}
                            </p>

                            <div className="mt-3.5 h-1 w-48 overflow-hidden rounded-full bg-white/20">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${activeFeatured.progressPercent}%`,
                                  backgroundColor: effectiveAccentColor,
                                }}
                              />
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                              <button
                                type="button"
                                onClick={handleResumeFeatured}
                                style={{ backgroundColor: effectiveAccentColor, color: '#0B0D12' }}
                                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
                              >
                                <Play className="h-4 w-4 fill-current" />
                                Reanudar
                              </button>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  aria-label="Elemento anterior"
                                  onClick={() =>
                                    setFeaturedIndex(
                                      (i) =>
                                        (i - 1 + FEATURED_ITEMS.length) % FEATURED_ITEMS.length,
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Siguiente elemento"
                                  onClick={() =>
                                    setFeaturedIndex((i) => (i + 1) % FEATURED_ITEMS.length)
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {homeRows.map((row, rowIdx) => (
                    <section key={row.id} aria-label={row.title} className="space-y-3">
                      <h2 className="font-display text-base sm:text-lg font-semibold tracking-tight text-white/90">
                        {row.title}
                      </h2>
                      <div className="no-scrollbar -mx-3 flex gap-5 overflow-x-auto px-3 py-3">
                        {row.apps.map((app, colIdx) => (
                          <TvAppCard
                            key={`${row.id}-${app.id}`}
                            app={app}
                            isFocused={focusPos.row === rowIdx && focusPos.col === colIdx}
                            cardSize={effectiveCardSize}
                            iconShape={effectiveIconShape}
                            focusAccentColor={effectiveAccentColor}
                            reduceMotion={reduceMotion}
                            layout="row"
                            onFocus={() => {
                              setFocusPos({ row: rowIdx, col: colIdx });
                              setFocusedAppId(app.id);
                            }}
                            onLaunch={handleLaunchApp}
                            onOpenOptions={setOptionsApp}
                            cardRef={(el) => {
                              cardRefs.current[`${row.id}:${app.id}`] = el;
                            }}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}

              {/* DESIGN 4: SOLO APPS ULTRA LIGERO */}
              {settings.layoutPreset === 'solo_apps' && (
                <section aria-label="Aplicaciones" className="space-y-5 pt-1">
                  <div className="flex items-baseline justify-between">
                    <h1 className="font-display text-xl font-semibold text-white">
                      Todas las aplicaciones
                    </h1>
                    <span className="font-mono-tabular text-xs text-white/50">
                      {homeRows[0]?.apps.length ?? 0} apps · {effectiveColumns} columnas
                    </span>
                  </div>
                  <div className={`grid gap-5 ${getGridClass(effectiveColumns)}`}>
                    {(homeRows[0]?.apps ?? []).map((app, colIdx) => (
                      <TvAppCard
                        key={app.id}
                        app={app}
                        isFocused={focusPos.row === 0 && focusPos.col === colIdx}
                        cardSize={effectiveCardSize}
                        iconShape={effectiveIconShape}
                        focusAccentColor={effectiveAccentColor}
                        reduceMotion={reduceMotion}
                        layout="grid"
                        onFocus={() => {
                          setFocusPos({ row: 0, col: colIdx });
                          setFocusedAppId(app.id);
                        }}
                        onLaunch={handleLaunchApp}
                        onOpenOptions={setOptionsApp}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* DESIGN 5: DOCK ZEN MINIMAL */}
              {settings.layoutPreset === 'dock_zen' && (
                <div className="flex flex-1 flex-col justify-between gap-8 py-4">
                  <div className="flex flex-col items-start justify-center pt-6 sm:pt-12 max-w-2xl">
                    <div className="font-mono-tabular text-6xl sm:text-7xl font-medium tracking-tight text-white">
                      {zenClockStr}
                    </div>
                    <p className="mt-1.5 text-base capitalize text-white/60">{zenDateStr}</p>
                    {settings.showFeatured && (
                      <div className="mt-7 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 backdrop-blur-md">
                        <div className="min-w-0">
                          <div className="text-xs text-white/55">
                            Continuar en {activeFeatured.appName}
                          </div>
                          <div className="font-display text-sm font-semibold text-white">
                            {activeFeatured.title}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleResumeFeatured}
                          style={{ backgroundColor: effectiveAccentColor, color: '#0B0D12' }}
                          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold hover:opacity-90 cursor-pointer shrink-0"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          Reanudar
                        </button>
                      </div>
                    )}
                  </div>

                  <section aria-label="Dock de Favoritos" className="space-y-3">
                    <h2 className="font-display text-sm font-medium text-white/70">
                      Accesos fijados
                    </h2>
                    <div className="no-scrollbar -mx-3 flex gap-5 overflow-x-auto px-3 py-3">
                      {activeDockApps.map((app, colIdx) => (
                        <TvAppCard
                          key={`dock-${app.id}`}
                          app={app}
                          isFocused={focusPos.row === 0 && focusPos.col === colIdx}
                          cardSize={effectiveCardSize}
                          iconShape={effectiveIconShape}
                          focusAccentColor={effectiveAccentColor}
                          reduceMotion={reduceMotion}
                          layout="row"
                          onFocus={() => {
                            setFocusPos({ row: 0, col: colIdx });
                            setFocusedAppId(app.id);
                          }}
                          onLaunch={handleLaunchApp}
                          onOpenOptions={setOptionsApp}
                          cardRef={(el) => {
                            cardRefs.current[`dock:${app.id}`] = el;
                          }}
                        />
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* DESIGN 6: BARRA LATERAL PRO */}
              {settings.layoutPreset === 'sidebar_pro' && (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[210px_1fr] pt-1">
                  <aside className="space-y-1.5">
                    {(
                      [
                        { id: 'favoritos', label: 'Favoritos' },
                        { id: 'streaming', label: 'Streaming' },
                        { id: 'utilidades', label: 'Herramientas TV' },
                        { id: 'juegos', label: 'Juegos' },
                        { id: 'todas', label: 'Todas las apps' },
                      ] as { id: 'favoritos' | 'todas' | AppCategory; label: string }[]
                    ).map((item) => {
                      const active = sidebarFilter === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSidebarFilter(item.id);
                            setFocusPos({ row: 0, col: 0 });
                          }}
                          style={
                            active
                              ? {
                                  borderColor: effectiveAccentColor,
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                }
                              : undefined
                          }
                          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors cursor-pointer ${
                            active
                              ? 'text-white'
                              : 'border-transparent text-white/60 hover:bg-white/[0.05] hover:text-white'
                          }`}
                        >
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </aside>

                  <section className="space-y-4">
                    <div className={`grid gap-5 ${getGridClass(Math.max(3, effectiveColumns - 1))}`}>
                      {sidebarApps.map((app, colIdx) => (
                        <TvAppCard
                          key={app.id}
                          app={app}
                          isFocused={focusPos.row === 0 && focusPos.col === colIdx}
                          cardSize={effectiveCardSize}
                          iconShape={effectiveIconShape}
                          focusAccentColor={effectiveAccentColor}
                          reduceMotion={reduceMotion}
                          layout="grid"
                          onFocus={() => {
                            setFocusPos({ row: 0, col: colIdx });
                            setFocusedAppId(app.id);
                          }}
                          onLaunch={handleLaunchApp}
                          onOpenOptions={setOptionsApp}
                        />
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* DESIGN 7: CINE COMPACTO (BENTO 2-COLUMN) */}
              {settings.layoutPreset === 'bento_cinema' && (
                <div className="space-y-8">
                  <section className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
                    <div
                      style={
                        focusPos.row === -2
                          ? { boxShadow: `0 0 0 2.5px ${effectiveAccentColor}` }
                          : undefined
                      }
                      className="lg:col-span-7 relative min-h-[250px] overflow-hidden rounded-2xl ring-1 ring-white/10"
                    >
                      <img
                        src={activeFeatured.backdropUrl}
                        alt={activeFeatured.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090B10]/95 via-[#090B10]/55 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-7">
                        <p className="text-xs text-white/70 mb-1">
                          Continuar en {activeFeatured.appName}
                        </p>
                        <h1 className="font-display text-2xl font-semibold text-white [text-wrap:balance]">
                          {activeFeatured.title}
                        </h1>
                        <p className="mt-1 text-xs text-white/70">{activeFeatured.meta}</p>
                        <div className="mt-4 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleResumeFeatured}
                            style={{ backgroundColor: effectiveAccentColor, color: '#0B0D12' }}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold hover:opacity-90 cursor-pointer"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            Reanudar
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFeaturedIndex((i) => (i + 1) % FEATURED_ITEMS.length)
                            }
                            className="rounded-xl bg-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/20 cursor-pointer"
                          >
                            Siguiente
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                      {activeDockApps.slice(0, 4).map((app, idx) => (
                        <TvAppCard
                          key={`bento-${app.id}`}
                          app={app}
                          isFocused={focusPos.row === -3 && focusPos.col === idx}
                          cardSize="compact"
                          iconShape="banner_16_9"
                          focusAccentColor={effectiveAccentColor}
                          reduceMotion={reduceMotion}
                          layout="grid"
                          onFocus={() => {
                            setFocusPos({ row: -3, col: idx });
                            setFocusedAppId(app.id);
                          }}
                          onLaunch={handleLaunchApp}
                          onOpenOptions={setOptionsApp}
                        />
                      ))}
                    </div>
                  </section>

                  {homeRows.map((row, rowIdx) => (
                    <section key={row.id} aria-label={row.title} className="space-y-3">
                      <h2 className="font-display text-base font-semibold text-white/90">
                        {row.title}
                      </h2>
                      <div className="no-scrollbar -mx-3 flex gap-5 overflow-x-auto px-3 py-3">
                        {row.apps.map((app, colIdx) => (
                          <TvAppCard
                            key={`${row.id}-${app.id}`}
                            app={app}
                            isFocused={focusPos.row === rowIdx && focusPos.col === colIdx}
                            cardSize={effectiveCardSize}
                            iconShape={effectiveIconShape}
                            focusAccentColor={effectiveAccentColor}
                            reduceMotion={reduceMotion}
                            layout="row"
                            onFocus={() => {
                              setFocusPos({ row: rowIdx, col: colIdx });
                              setFocusedAppId(app.id);
                            }}
                            onLaunch={handleLaunchApp}
                            onOpenOptions={setOptionsApp}
                            cardRef={(el) => {
                              cardRefs.current[`${row.id}:${app.id}`] = el;
                            }}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: APLICACIONES (Full Adaptive Grid) */}
          {activeTab === 'aplicaciones' && (
            <div className="space-y-7 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-semibold text-white">
                    Todas las aplicaciones
                  </h1>
                  <p className="mt-0.5 text-sm text-white/55">
                    {filteredGridApps.length} aplicaciones · Optimizado para {deviceSpec.shortLabel}
                  </p>
                </div>

                <div className="flex items-center gap-1 rounded-xl bg-white/[0.05] p-1">
                  {(
                    [
                      { id: 'todas', label: 'Todas' },
                      { id: 'streaming', label: 'Streaming' },
                      { id: 'utilidades', label: 'Utilidades' },
                      { id: 'juegos', label: 'Juegos' },
                    ] as { id: 'todas' | AppCategory; label: string }[]
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(cat.id);
                        setFocusPos({ row: 0, col: 0 });
                      }}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        categoryFilter === cat.id
                          ? 'bg-white text-[#0B0D12]'
                          : 'text-white/65 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`grid gap-5 ${getGridClass(effectiveColumns)}`}>
                {filteredGridApps.map((app, colIdx) => (
                  <TvAppCard
                    key={app.id}
                    app={app}
                    isFocused={focusPos.row === 0 && focusPos.col === colIdx}
                    cardSize={effectiveCardSize}
                    iconShape={effectiveIconShape}
                    focusAccentColor={effectiveAccentColor}
                    reduceMotion={reduceMotion}
                    layout="grid"
                    onFocus={() => {
                      setFocusPos({ row: 0, col: colIdx });
                      setFocusedAppId(app.id);
                    }}
                    onLaunch={handleLaunchApp}
                    onOpenOptions={setOptionsApp}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ENTRADAS HDMI / USB */}
          {activeTab === 'entradas' && (
            <div className="space-y-7 pt-2 max-w-4xl">
              <div>
                <h1 className="font-display text-2xl font-semibold text-white">
                  Entradas y fuentes
                </h1>
                <p className="mt-0.5 text-sm text-white/55">
                  Cambia rápidamente entre HDMI y almacenamiento conectado al TV Box / Fire TV
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {HDMI_INPUTS.map((input, idx) => {
                  const isActive = activeInputId === input.id;
                  const isFocused = focusPos.row === 0 && focusPos.col === idx;

                  const IconComp =
                    input.icon === 'gamepad'
                      ? Gamepad2
                      : input.icon === 'speaker'
                        ? Speaker
                        : input.icon === 'usb'
                          ? HardDrive
                          : Tv;

                  return (
                    <button
                      key={input.id}
                      type="button"
                      onMouseEnter={() => setFocusPos({ row: 0, col: idx })}
                      onClick={() =>
                        handleSelectInput(input.id, `${input.name} · ${input.sourceLabel}`)
                      }
                      style={
                        isFocused
                          ? { boxShadow: `0 0 0 2px ${effectiveAccentColor}` }
                          : undefined
                      }
                      className={`flex items-center justify-between gap-4 rounded-2xl border p-5 text-left transition-all duration-150 cursor-pointer ${
                        isFocused
                          ? 'scale-[1.02] border-transparent bg-white/12'
                          : isActive
                            ? 'border-white/30 bg-white/[0.08]'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                            isActive ? 'bg-white text-[#0B0D12]' : 'bg-white/10 text-white/80'
                          }`}
                        >
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-display text-base font-semibold text-white">
                            {input.name}
                          </div>
                          <div className="truncate text-sm text-white/65">
                            {input.sourceLabel}
                          </div>
                          <div className="font-mono-tabular mt-1 text-xs text-white/45">
                            {input.resolution}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-medium text-white/80 shrink-0">
                        {isActive ? 'Activa' : input.connected ? 'Cambiar' : 'En espera'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* Quiet Optional D-Pad Hint Footer */}
        {settings.showHints && (
          <footer className="flex flex-wrap items-center justify-between gap-3 px-6 pb-5 pt-2 md:px-12">
            <p className="text-xs text-white/40">
              Flechas Navegar · Enter Abrir · M Opciones de app · / Buscar · Sesión blindada: {activeUser.name}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs text-white/40 font-mono-tabular">
              <Cpu className="h-3.5 w-3.5" />
              {deviceSpec.osLabel}
            </span>
          </footer>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-white/15 bg-[#141A26]/95 px-4 py-3 text-xs font-medium text-white shadow-2xl backdrop-blur-md">
          {toastMessage}
        </div>
      )}

      {/* Overlays */}
      <SearchOverlay
        isOpen={isSearchOpen}
        apps={visibleApps}
        onClose={() => setIsSearchOpen(false)}
        onLaunchApp={handleLaunchApp}
      />

      <AppOptionsModal
        app={optionsApp}
        isPinned={optionsApp ? pinnedIds.includes(optionsApp.id) : false}
        canMoveLeft={optionsApp ? pinnedIds.indexOf(optionsApp.id) > 0 : false}
        canMoveRight={
          optionsApp
            ? pinnedIds.indexOf(optionsApp.id) !== -1 &&
              pinnedIds.indexOf(optionsApp.id) < pinnedIds.length - 1
            : false
        }
        onClose={() => setOptionsApp(null)}
        onLaunch={handleLaunchApp}
        onTogglePin={handleTogglePin}
        onMove={handleMovePinned}
        onHide={handleHideApp}
      />

      <AppLaunchModal app={launchedApp} onClose={() => setLaunchedApp(null)} />

      <ShareQrModal
        isOpen={isShareQrOpen}
        config={shareableConfig}
        onClose={() => setIsShareQrOpen(false)}
        onImportConfig={handleImportConfig}
      />

      <ScreensaverOverlay
        isOpen={isScreensaverOpen}
        wallpaper={settings.wallpaper}
        pixelShift={settings.oledProtector && settings.oledPixelShift}
        onExit={() => setIsScreensaverOpen(false)}
      />

      <FireTvGuideModal
        mode={fireTvModalMode}
        firewallEnabled={settings.firewallEnabled}
        isDefaultLauncher={settings.isDefaultLauncher}
        onToggleFirewall={(enabled) => updateSettings({ firewallEnabled: enabled })}
        onToggleDefaultLauncher={(isDefault) => updateSettings({ isDefaultLauncher: isDefault })}
        onClose={() => setFireTvModalMode(null)}
      />

      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        report={diagnosticReport}
        running={diagnosticsRunning}
        onRerun={executeDiagnostics}
        onApplyRecommendation={(report) => {
          const spec = DEVICE_PROFILES[report.recommendedDevice];
          updateSettings({
            layoutPreset: report.recommendedPreset,
            iconShape: spec.recommendedShape,
            ambientGlow: !report.recommendedLowRam,
            calibration: {
              ...settings.calibration,
              deviceProfile: report.recommendedDevice,
              lowRamMode: report.recommendedLowRam,
            },
          });
          showToast(`Perfil recomendado aplicado: ${spec.shortLabel}`);
        }}
        onClose={() => setIsDiagnosticsOpen(false)}
      />

      <ApkExportModal
        isOpen={isApkExportOpen}
        onClose={() => setIsApkExportOpen(false)}
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        settings={settings}
        allVisibleApps={visibleApps}
        hiddenApps={hiddenApps}
        users={users}
        activeUser={activeUser}
        sleepMinutesLeft={sleepMinutesLeft}
        diagnosticReport={diagnosticReport}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={updateSettings}
        onUpdateActiveUser={handleUpdateActiveUserMeta}
        onCreateUser={handleCreateUser}
        onSwitchUserLock={handleLockSession}
        onRestoreHiddenApp={handleRestoreApp}
        onAddCustomApp={handleAddCustomApp}
        onSetSleepTimer={handleSetSleepTimer}
        onOpenScreensaver={() => setIsScreensaverOpen(true)}
        onOpenShareQr={() => setIsShareQrOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenApkExport={() => setIsApkExportOpen(true)}
        onOpenFireTvGuide={(mode) => {
          setIsSettingsOpen(false);
          setFireTvModalMode(mode);
        }}
        onResetUserDefaults={handleResetUserDefaults}
      />
    </div>
    </OledPixelShift>
  );
}
