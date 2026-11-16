import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Check,
  Cpu,
  Gamepad2,
  Lock,
  Monitor,
  Moon,
  Package,
  Plus,
  QrCode,
  RotateCcw,
  Shield,
  Sparkles,
  Tv,
  UserPlus,
  X,
} from 'lucide-react';
import {
  COLOR_PALETTES,
  LAYOUT_PRESETS,
  QUICK_PROFILES,
  WALLPAPERS,
} from '../data/tvApps';
import {
  AppCategory,
  CardSize,
  DeviceProfileId,
  DiagnosticReport,
  IconShape,
  LauncherSettings,
  LayoutPresetId,
  QuickBarVisibility,
  TvApp,
  TvPanelType,
  TvResolution,
  UserProfile,
  WallpaperId,
} from '../types/launcher';
import { computeTvMetrics, DEVICE_PROFILES } from '../utils/tvOptimizer';

type SettingsSection = 'disenos' | 'dispositivo' | 'colores' | 'panel' | 'usuarios';

interface SettingsDrawerProps {
  isOpen: boolean;
  settings: LauncherSettings;
  allVisibleApps: TvApp[];
  hiddenApps: TvApp[];
  users: UserProfile[];
  activeUser: UserProfile;
  sleepMinutesLeft: number | null;
  diagnosticReport: DiagnosticReport | null;
  onClose: () => void;
  onUpdateSettings: (patch: Partial<LauncherSettings>) => void;
  onUpdateActiveUser: (patch: Partial<Pick<UserProfile, 'name' | 'pin' | 'lockOnTvOff' | 'avatarColor'>>) => void;
  onCreateUser: (name: string, pin: string) => void;
  onSwitchUserLock: () => void;
  onRestoreHiddenApp: (appId: string) => void;
  onAddCustomApp: (
    name: string,
    category: AppCategory,
    accentColor: string,
    customUrl?: string,
  ) => void;
  onSetSleepTimer: (minutes: number | null) => void;
  onOpenScreensaver: () => void;
  onOpenShareQr: () => void;
  onOpenDiagnostics: () => void;
  onOpenApkExport: () => void;
  onOpenFireTvGuide: (mode: 'sideload' | 'firewall') => void;
  onResetUserDefaults: () => void;
}

const SHORTCUT_COLORS = ['#22D3EE', '#34D399', '#A78BFA', '#F59E0B', '#FB7185'];

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  settings,
  allVisibleApps,
  hiddenApps,
  users,
  activeUser,
  sleepMinutesLeft,
  diagnosticReport,
  onClose,
  onUpdateSettings,
  onUpdateActiveUser,
  onCreateUser,
  onSwitchUserLock,
  onRestoreHiddenApp,
  onAddCustomApp,
  onSetSleepTimer,
  onOpenScreensaver,
  onOpenShareQr,
  onOpenDiagnostics,
  onOpenApkExport,
  onOpenFireTvGuide,
  onResetUserDefaults,
}) => {
  const [section, setSection] = useState<SettingsSection>('disenos');
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<AppCategory>('streaming');
  const [newColor, setNewColor] = useState(SHORTCUT_COLORS[0]);

  const [editUserName, setEditUserName] = useState(activeUser.name);
  const [editUserPin, setEditUserPin] = useState(activeUser.pin);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPin, setNewUserPin] = useState('');

  useEffect(() => {
    setEditUserName(activeUser.name);
    setEditUserPin(activeUser.pin);
  }, [activeUser]);

  const tvMetrics = useMemo(
    () => computeTvMetrics(settings.calibration),
    [settings.calibration],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateCalibration = (patch: Partial<LauncherSettings['calibration']>) => {
    const nextCal = { ...settings.calibration, ...patch };
    if (nextCal.autoOptimize) {
      const computed = computeTvMetrics(nextCal);
      onUpdateSettings({
        calibration: nextCal,
        cardSize: computed.cardSize,
        gridColumns: computed.columns,
        iconShape: computed.iconShape,
      });
    } else {
      onUpdateSettings({ calibration: nextCal });
    }
  };

  const handleSelectDevice = (deviceId: DeviceProfileId) => {
    const spec = DEVICE_PROFILES[deviceId];
    updateCalibration({
      deviceProfile: deviceId,
      lowRamMode: spec.defaultLowRam,
    });
  };

  const updateQuickBar = (key: keyof QuickBarVisibility, value: boolean) => {
    onUpdateSettings({
      quickBar: {
        ...settings.quickBar,
        [key]: value,
      },
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddCustomApp(trimmed, newCategory, newColor, newUrl.trim() || undefined);
    setNewName('');
    setNewUrl('');
  };

  const handleSaveUserProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = editUserPin.replace(/\D/g, '').slice(0, 4);
    onUpdateActiveUser({
      name: editUserName.trim() || activeUser.name,
      pin: cleanPin,
    });
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newUserName.trim();
    if (!name) return;
    const pin = newUserPin.replace(/\D/g, '').slice(0, 4);
    onCreateUser(name, pin);
    setNewUserName('');
    setNewUserPin('');
  };

  const renderPresetMiniPreview = (id: LayoutPresetId) => {
    switch (id) {
      case 'tonalix_dock':
        return (
          <div className="flex h-11 w-16 flex-col justify-between rounded-md bg-white/[0.06] p-1.5">
            <div className="h-2.5 w-full rounded-sm bg-cyan-400/35" />
            <div className="grid grid-cols-4 gap-1">
              <div className="h-3 rounded-sm bg-white/25" />
              <div className="h-3 rounded-sm bg-white/25" />
              <div className="h-3 rounded-sm bg-white/25" />
              <div className="h-3 rounded-sm bg-white/25" />
            </div>
          </div>
        );
      case 'fire_tv':
        return (
          <div className="flex h-11 w-16 flex-col gap-1 rounded-md bg-white/[0.06] p-1.5">
            <div className="h-4 w-full rounded-sm bg-sky-400/35" />
            <div className="grid grid-cols-5 gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-1.5 rounded-sm bg-white/25" />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
              <div className="rounded-sm bg-white/15" />
              <div className="rounded-sm bg-white/15" />
              <div className="rounded-sm bg-white/15" />
            </div>
          </div>
        );
      case 'leanback':
        return (
          <div className="flex h-11 w-16 flex-col gap-1 rounded-md bg-white/[0.06] p-1.5">
            <div className="h-4 w-full rounded-sm bg-white/25" />
            <div className="grid grid-cols-3 gap-1 flex-1">
              <div className="rounded-sm bg-white/15" />
              <div className="rounded-sm bg-white/15" />
              <div className="rounded-sm bg-white/15" />
            </div>
          </div>
        );
      case 'solo_apps':
        return (
          <div className="grid h-11 w-16 grid-cols-3 grid-rows-2 gap-1 rounded-md bg-white/[0.06] p-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-sm bg-white/20" />
            ))}
          </div>
        );
      case 'dock_zen':
        return (
          <div className="flex h-11 w-16 flex-col justify-between rounded-md bg-white/[0.06] p-1.5">
            <div className="mx-auto mt-1 h-2.5 w-8 rounded-sm bg-white/30" />
            <div className="grid grid-cols-4 gap-1">
              <div className="h-2.5 rounded-sm bg-white/20" />
              <div className="h-2.5 rounded-sm bg-white/20" />
              <div className="h-2.5 rounded-sm bg-white/20" />
              <div className="h-2.5 rounded-sm bg-white/20" />
            </div>
          </div>
        );
      case 'sidebar_pro':
        return (
          <div className="flex h-11 w-16 gap-1 rounded-md bg-white/[0.06] p-1.5">
            <div className="w-3.5 rounded-sm bg-white/25" />
            <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-1">
              <div className="rounded-sm bg-white/15" />
              <div className="rounded-sm bg-white/15" />
              <div className="rounded-sm bg-white/15" />
              <div className="rounded-sm bg-white/15" />
            </div>
          </div>
        );
      case 'bento_cinema':
        return (
          <div className="flex h-11 w-16 flex-col gap-1 rounded-md bg-white/[0.06] p-1.5">
            <div className="flex gap-1 h-5">
              <div className="flex-1 rounded-sm bg-white/25" />
              <div className="w-4 rounded-sm bg-white/15" />
            </div>
            <div className="grid grid-cols-4 gap-1 flex-1">
              <div className="rounded-sm bg-white/15" />
              <div className="rounded-sm bg-white/15" />
              <div className="rounded-sm bg-white/15" />
              <div className="rounded-sm bg-white/15" />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ajustes de Tonalix TV"
      className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        className="flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-[#0F141D] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Tonalix TV · Centro de Control
            </h2>
            <p className="text-xs text-white/55">
              Perfil activo: <span className="text-white/90 font-medium">{activeUser.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ajustes"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/65 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 5 Section Tabs */}
        <div className="border-b border-white/[0.08] px-6 py-3">
          <div className="grid grid-cols-5 gap-1 rounded-xl bg-white/[0.04] p-1">
            {(
              [
                { id: 'disenos', label: 'Diseños' },
                { id: 'dispositivo', label: 'Dispositivo' },
                { id: 'colores', label: 'Colores' },
                { id: 'panel', label: 'Panel/Apps' },
                { id: 'usuarios', label: 'Usuarios' },
              ] as { id: SettingsSection; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSection(tab.id)}
                className={`rounded-lg py-2 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  section === tab.id
                    ? 'bg-white text-[#0B0D12]'
                    : 'text-white/65 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
          {/* TAB 1: DISEÑOS */}
          {section === 'disenos' && (
            <>
              <section>
                <h3 className="text-sm font-semibold text-white/90 mb-3">
                  7 Diseños de Inicio Combinables
                </h3>
                <div className="space-y-2">
                  {LAYOUT_PRESETS.map((preset) => {
                    const active = settings.layoutPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onUpdateSettings({ layoutPreset: preset.id })}
                        className={`flex w-full items-center gap-4 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                          active
                            ? 'border-white bg-white/12 text-white'
                            : 'border-white/10 bg-white/[0.02] text-white/75 hover:bg-white/[0.06]'
                        }`}
                      >
                        {renderPresetMiniPreview(preset.id)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-white">
                              {preset.name}
                            </span>
                            {active && <Check className="h-4 w-4 text-white shrink-0" />}
                          </div>
                          <p className="mt-0.5 text-xs text-white/55">{preset.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-2.5">
                <h3 className="text-sm font-semibold text-white/90">Forma de los iconos</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      {
                        id: 'tonalix_square',
                        title: 'Cuadrado Tonalix',
                        desc: 'Compacto para dock y TV Box',
                      },
                      {
                        id: 'banner_16_9',
                        title: 'Banner 16:9 Android/Fire',
                        desc: 'Tarjetas panorámicas Leanback',
                      },
                    ] as { id: IconShape; title: string; desc: string }[]
                  ).map((shape) => {
                    const active = settings.iconShape === shape.id;
                    return (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() => onUpdateSettings({ iconShape: shape.id })}
                        className={`rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                          active
                            ? 'border-white bg-white/12 text-white'
                            : 'border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="text-xs font-semibold">{shape.title}</div>
                        <div className="mt-0.5 text-[11px] text-white/55">{shape.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-white/90 mb-3">
                  Perfiles rápidos en 1 clic
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {QUICK_PROFILES.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => onUpdateSettings(profile.patch)}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left hover:border-white/30 hover:bg-white/[0.07] transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-white">{profile.name}</div>
                      <div className="mt-0.5 text-[11px] text-white/55 leading-snug">
                        {profile.description}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Boot App on Startup */}
              <section className="space-y-2.5">
                <h3 className="text-sm font-semibold text-white/90">
                  App de arranque al iniciar la TV
                </h3>
                <select
                  value={settings.bootAppId ?? ''}
                  onChange={(e) =>
                    onUpdateSettings({ bootAppId: e.target.value ? e.target.value : null })
                  }
                  className="w-full rounded-xl border border-white/12 bg-[#0A0E15] px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
                >
                  <option value="">Ninguna (quedar en Tonalix TV Launcher)</option>
                  {allVisibleApps.map((app) => (
                    <option key={app.id} value={app.id}>
                      Abrir automáticamente: {app.name}
                    </option>
                  ))}
                </select>
              </section>
            </>
          )}

          {/* TAB 2: DISPOSITIVO Y AUTO-CALIBRACIÓN */}
          {section === 'dispositivo' && (
            <>
              <section className="rounded-xl border border-emerald-400/25 bg-emerald-500/[0.06] p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Activity className="h-4 w-4 text-emerald-300 shrink-0" />
                    Autodiagnóstico CPU y Red
                  </div>
                  <p className="mt-0.5 font-mono-tabular text-[11px] text-white/65 truncate">
                    {diagnosticReport
                      ? `CPU ${diagnosticReport.cpuResponseMs} ms · Red ${diagnosticReport.networkLatencyMs ?? '—'} ms`
                      : 'Analizar rendimiento del procesador y latencia'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDiagnostics();
                  }}
                  className="rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-[#0B0D12] hover:bg-white/90 cursor-pointer shrink-0"
                >
                  Analizar
                </button>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white/90">
                      Optimización por Dispositivo
                    </h3>
                  </div>
                </div>
                <div className="space-y-2">
                  {(Object.keys(DEVICE_PROFILES) as DeviceProfileId[]).map((devId) => {
                    const dev = DEVICE_PROFILES[devId];
                    const active = settings.calibration.deviceProfile === devId;
                    return (
                      <button
                        key={devId}
                        type="button"
                        onClick={() => handleSelectDevice(devId)}
                        className={`flex w-full items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                          active
                            ? 'border-white bg-white/12 text-white'
                            : 'border-white/10 bg-white/[0.02] text-white/75 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white">{dev.name}</div>
                          <div className="mt-0.5 text-xs text-white/55">{dev.description}</div>
                        </div>
                        <span className="font-mono-tabular shrink-0 text-[11px] text-cyan-300">
                          {dev.ramGb} GB
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-xl border border-white/12 bg-white/[0.04] p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-sky-400 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Auto-optimizar por TV y distancia
                      </div>
                      <div className="text-xs text-white/55">
                        Acomoda columnas, iconos y escala automáticamente
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.calibration.autoOptimize}
                    onChange={(e) =>
                      updateCalibration({ autoOptimize: e.target.checked })
                    }
                    className="h-4 w-4 accent-white cursor-pointer"
                  />
                </div>
                <div className="rounded-lg bg-[#0A0D14] px-3.5 py-2.5 text-xs text-white/80">
                  <div className="font-semibold text-white">{tvMetrics.comfortLabel}</div>
                  <div className="font-mono-tabular mt-0.5 text-[11px] text-white/65">
                    {tvMetrics.summary}
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="tv-inches" className="text-sm font-semibold text-white/90">
                    Tamaño del televisor
                  </label>
                  <span className="font-mono-tabular text-sm font-semibold text-white">
                    {settings.calibration.tvInches}&quot;
                  </span>
                </div>
                <input
                  id="tv-inches"
                  type="range"
                  min={24}
                  max={85}
                  step={1}
                  value={settings.calibration.tvInches}
                  onChange={(e) =>
                    updateCalibration({ tvInches: Number(e.target.value) })
                  }
                  className="w-full accent-white cursor-pointer"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[32, 43, 50, 55, 65, 75].map((inches) => (
                    <button
                      key={inches}
                      type="button"
                      onClick={() => updateCalibration({ tvInches: inches })}
                      className={`rounded-lg px-3 py-1.5 font-mono-tabular text-xs cursor-pointer ${
                        settings.calibration.tvInches === inches
                          ? 'bg-white text-[#0B0D12] font-semibold'
                          : 'bg-white/[0.05] text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {inches}&quot;
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="tv-dist" className="text-sm font-semibold text-white/90">
                    Distancia de visión
                  </label>
                  <span className="font-mono-tabular text-sm font-semibold text-white">
                    {settings.calibration.viewingDistanceM.toFixed(1)} m
                  </span>
                </div>
                <input
                  id="tv-dist"
                  type="range"
                  min={1.0}
                  max={5.0}
                  step={0.1}
                  value={settings.calibration.viewingDistanceM}
                  onChange={(e) =>
                    updateCalibration({ viewingDistanceM: Number(e.target.value) })
                  }
                  className="w-full accent-white cursor-pointer"
                />
              </section>

              <section className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-white/80 mb-2">Resolución</div>
                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/[0.04] p-1">
                    {(['720p', '1080p', '4k'] as TvResolution[]).map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => updateCalibration({ resolution: res })}
                        className={`rounded-lg py-1.5 text-[11px] font-medium uppercase cursor-pointer ${
                          settings.calibration.resolution === res
                            ? 'bg-white text-[#0B0D12]'
                            : 'text-white/65 hover:text-white'
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white/80 mb-2">Panel</div>
                  <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/[0.04] p-1">
                    {(['led', 'oled'] as TvPanelType[]).map((panel) => (
                      <button
                        key={panel}
                        type="button"
                        onClick={() => updateCalibration({ panelType: panel })}
                        className={`rounded-lg py-1.5 text-[11px] font-medium uppercase cursor-pointer ${
                          settings.calibration.panelType === panel
                            ? 'bg-white text-[#0B0D12]'
                            : 'text-white/65 hover:text-white'
                        }`}
                      >
                        {panel}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="text-xs font-semibold text-white/80">Margen Overscan HDMI</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {([0, 2, 4] as const).map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => updateCalibration({ overscanPercent: pct })}
                      className={`rounded-xl border py-2 font-mono-tabular text-xs cursor-pointer ${
                        settings.calibration.overscanPercent === pct
                          ? 'border-white bg-white/12 text-white'
                          : 'border-white/10 bg-white/[0.02] text-white/65 hover:bg-white/[0.06]'
                      }`}
                    >
                      {pct === 0 ? 'Sin margen' : `${pct}%`}
                    </button>
                  ))}
                </div>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 cursor-pointer">
                  <span className="text-sm text-white/90">
                    Turbo Light (reducir animaciones para ahorrar RAM)
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.calibration.lowRamMode}
                    onChange={(e) => updateCalibration({ lowRamMode: e.target.checked })}
                    className="h-4 w-4 accent-white cursor-pointer"
                  />
                </label>
              </section>

              {!settings.calibration.autoOptimize && (
                <section className="space-y-3 border-t border-white/[0.08] pt-4">
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-white/[0.04] p-1">
                    {(
                      [
                        { id: 'compact', label: 'Compacto' },
                        { id: 'standard', label: 'Estándar' },
                        { id: 'large', label: 'Grande' },
                      ] as { id: CardSize; label: string }[]
                    ).map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => onUpdateSettings({ cardSize: size.id })}
                        className={`rounded-lg py-2 text-xs font-medium cursor-pointer ${
                          settings.cardSize === size.id
                            ? 'bg-white text-[#0B0D12]'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* TAB 3: PALETAS DE COLORES Y FONDOS */}
          {section === 'colores' && (
            <>
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-white/90">Paletas de Color</h3>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PALETTES.map((pal) => {
                    const active =
                      settings.accentColor.toLowerCase() === pal.accentColor.toLowerCase();
                    return (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() =>
                          onUpdateSettings({
                            accentColor: pal.accentColor,
                            surfaceTint: pal.surfaceTint,
                          })
                        }
                        className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                          active
                            ? 'border-white bg-white/12 text-white'
                            : 'border-white/10 bg-white/[0.02] text-white/75 hover:bg-white/[0.06]'
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full shrink-0 ring-1 ring-white/25"
                          style={{ backgroundColor: pal.accentColor }}
                        />
                        <span className="text-xs font-medium truncate">{pal.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
                  <div>
                    <div className="text-xs font-medium text-white">Acento Hex personalizado</div>
                    <div className="font-mono-tabular text-[11px] text-white/50">
                      {settings.accentColor.toUpperCase()}
                    </div>
                  </div>
                  <input
                    type="color"
                    aria-label="Color personalizado"
                    value={settings.accentColor}
                    onChange={(e) => onUpdateSettings({ accentColor: e.target.value })}
                    className="h-8 w-12 cursor-pointer rounded border-0 bg-transparent"
                  />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-white/90 mb-3">Fondo de pantalla</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {(Object.keys(WALLPAPERS) as WallpaperId[]).map((wpId) => {
                    const wp = WALLPAPERS[wpId];
                    const active = settings.wallpaper === wpId;
                    return (
                      <button
                        key={wpId}
                        type="button"
                        onClick={() => onUpdateSettings({ wallpaper: wpId })}
                        className={`group relative overflow-hidden rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? 'border-white ring-1 ring-white'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className={`h-16 w-full ${wp.bgClass} relative overflow-hidden`}>
                          {wp.imageUrl && (
                            <img
                              src={wp.imageUrl}
                              alt={wp.name}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover opacity-80"
                            />
                          )}
                          {active && (
                            <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#0B0D12]">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div className="bg-[#151A26] px-3 py-2">
                          <div className="text-xs font-medium text-white truncate">{wp.name}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="bg-bright" className="text-xs font-semibold text-white/85">
                    Brillo del fondo
                  </label>
                  <span className="font-mono-tabular text-xs text-white/70">
                    {settings.wallpaperBrightness}%
                  </span>
                </div>
                <input
                  id="bg-bright"
                  type="range"
                  min={15}
                  max={95}
                  step={5}
                  value={settings.wallpaperBrightness}
                  onChange={(e) =>
                    onUpdateSettings({ wallpaperBrightness: Number(e.target.value) })
                  }
                  className="w-full accent-white cursor-pointer"
                />
                <label className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 cursor-pointer">
                  <span className="text-sm text-white/85">Halo ambiental por app enfocada</span>
                  <input
                    type="checkbox"
                    checked={settings.ambientGlow}
                    onChange={(e) => onUpdateSettings({ ambientGlow: e.target.checked })}
                    className="h-4 w-4 accent-white cursor-pointer"
                  />
                </label>

                <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/[0.05] p-4 space-y-3">
                  <div className="text-sm font-semibold text-white">Protector OLED</div>
                  <p className="text-xs text-white/55 leading-relaxed">
                    Evita retención de imagen con desplazamiento sutil de píxeles y reloj
                    ambiental a pantalla completa.
                  </p>
                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <span className="text-xs text-white/85">Activar protector OLED</span>
                    <input
                      type="checkbox"
                      checked={settings.oledProtector}
                      onChange={(e) => onUpdateSettings({ oledProtector: e.target.checked })}
                      className="h-4 w-4 accent-cyan-400 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <span className="text-xs text-white/85">Pixel-shift periódico en la UI</span>
                    <input
                      type="checkbox"
                      checked={settings.oledPixelShift}
                      disabled={!settings.oledProtector}
                      onChange={(e) => onUpdateSettings({ oledPixelShift: e.target.checked })}
                      className="h-4 w-4 accent-cyan-400 cursor-pointer"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenScreensaver();
                    }}
                    className="w-full rounded-lg border border-white/15 bg-white/[0.06] py-2 text-xs font-semibold text-white hover:bg-white/12 cursor-pointer"
                  >
                    Probar protector ahora
                  </button>
                </div>
              </section>

              {/* MODO NOCHE PROGRAMABLE */}
              <section className="rounded-xl border border-amber-400/25 bg-amber-500/[0.05] p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Moon className="h-4 w-4 text-amber-300 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Modo Noche Programable
                      </div>
                      <div className="text-xs text-white/55">
                        Cambia a tonos cálidos y atenúa el brillo automáticamente
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.nightMode.enabled}
                    onChange={(e) =>
                      onUpdateSettings({
                        nightMode: { ...settings.nightMode, enabled: e.target.checked },
                      })
                    }
                    className="h-4 w-4 accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-white/60 mb-1">
                      Activar desde
                    </label>
                    <input
                      type="time"
                      value={settings.nightMode.startTime}
                      onChange={(e) =>
                        onUpdateSettings({
                          nightMode: { ...settings.nightMode, startTime: e.target.value },
                        })
                      }
                      className="w-full rounded-lg border border-white/12 bg-[#0A0D14] px-3 py-1.5 font-mono-tabular text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/60 mb-1">
                      Terminar a las
                    </label>
                    <input
                      type="time"
                      value={settings.nightMode.endTime}
                      onChange={(e) =>
                        onUpdateSettings({
                          nightMode: { ...settings.nightMode, endTime: e.target.value },
                        })
                      }
                      className="w-full rounded-lg border border-white/12 bg-[#0A0D14] px-3 py-1.5 font-mono-tabular text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/75">Brillo de fondo nocturno</span>
                    <span className="font-mono-tabular text-amber-200">
                      {settings.nightMode.nightBrightness}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    step={5}
                    value={settings.nightMode.nightBrightness}
                    onChange={(e) =>
                      onUpdateSettings({
                        nightMode: {
                          ...settings.nightMode,
                          nightBrightness: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/75">Filtro cálido anti-luz azul</span>
                    <span className="font-mono-tabular text-amber-200">
                      {settings.nightMode.warmFilterOpacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={35}
                    step={2}
                    value={settings.nightMode.warmFilterOpacity}
                    onChange={(e) =>
                      onUpdateSettings({
                        nightMode: {
                          ...settings.nightMode,
                          warmFilterOpacity: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-white/80">Probar tono cálido ahora</span>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        nightMode: {
                          ...settings.nightMode,
                          forcePreview: !settings.nightMode.forcePreview,
                        },
                      })
                    }
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      settings.nightMode.forcePreview
                        ? 'bg-amber-400 text-[#120D05]'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {settings.nightMode.forcePreview ? 'Vista previa activa' : 'Previsualizar'}
                  </button>
                </div>
              </section>
            </>
          )}

          {/* TAB 4: VISIBILIDAD PANEL RÁPIDO, MODO JUEGO, FIRE TV & APPS */}
          {section === 'panel' && (
            <>
              <section className="space-y-2.5">
                <h3 className="text-sm font-semibold text-white/90">
                  Visibilidad de Iconos y Panel Rápido
                </h3>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2.5 cursor-pointer">
                  <span className="text-xs sm:text-sm text-white/85">
                    Mostrar Banner Destacado
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.showFeatured}
                    onChange={(e) => onUpdateSettings({ showFeatured: e.target.checked })}
                    className="h-4 w-4 accent-cyan-400 cursor-pointer"
                  />
                </label>

                {(
                  [
                    { key: 'showSearch', label: 'Mostrar Botón Búsqueda' },
                    { key: 'showTurboBoost', label: 'Mostrar Botón Turbo Boost' },
                    { key: 'showWifi', label: 'Mostrar Botón WiFi' },
                    { key: 'showBluetooth', label: 'Mostrar Botón Bluetooth' },
                    { key: 'showGameMode', label: 'Mostrar Botón Modo Juego' },
                    { key: 'showDistanceInputs', label: 'Mostrar Botón Distancia / Fuentes' },
                    { key: 'showRamHealth', label: 'Mostrar Botón Memoria / Salud RAM' },
                    { key: 'showFirewall', label: 'Mostrar Botón Seguridad / Firewall' },
                    { key: 'showShareQr', label: 'Mostrar Botón Enviar QR / Enlace' },
                    { key: 'showVoiceCommand', label: 'Mostrar Botón Comando de Voz (Mic)' },
                  ] as { key: keyof QuickBarVisibility; label: string }[]
                ).map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2.5 cursor-pointer hover:bg-white/[0.05]"
                  >
                    <span className="text-xs sm:text-sm text-white/85">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={settings.quickBar[item.key]}
                      onChange={(e) => updateQuickBar(item.key, e.target.checked)}
                      className="h-4 w-4 accent-cyan-400 cursor-pointer"
                    />
                  </label>
                ))}
              </section>

              {/* Gamer Mode */}
              <section className="space-y-2.5">
                <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-violet-400" />
                  Experiencia Gamer
                </h3>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 cursor-pointer">
                  <span className="text-sm text-white/85">Activar Modo Juego</span>
                  <input
                    type="checkbox"
                    checked={settings.gameMode}
                    onChange={(e) => onUpdateSettings({ gameMode: e.target.checked })}
                    className="h-4 w-4 accent-violet-400 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 cursor-pointer">
                  <span className="text-xs text-white/80">
                    Cambiar dock a Emuladores/Juegos automáticamente en Modo Juego
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.autoSwitchGamesOnGameMode}
                    onChange={(e) =>
                      onUpdateSettings({ autoSwitchGamesOnGameMode: e.target.checked })
                    }
                    className="h-4 w-4 accent-violet-400 cursor-pointer shrink-0"
                  />
                </label>
              </section>

              {/* Fire TV Sideload, Firewall & APK/WGT Export */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => onOpenFireTvGuide('sideload')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-xs font-semibold text-white hover:bg-white/12 cursor-pointer"
                >
                  <Tv className="h-4 w-4 text-sky-400" />
                  Guía Fire TV / Predeterminado
                </button>
                <button
                  type="button"
                  onClick={() => onOpenFireTvGuide('firewall')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-xs font-semibold text-white hover:bg-white/12 cursor-pointer"
                >
                  <Shield className="h-4 w-4 text-cyan-400" />
                  Seguridad / Firewall TV
                </button>
              </section>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenApkExport();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#0B0D12] hover:bg-white/90 cursor-pointer"
              >
                <Package className="h-4 w-4" />
                Exportar a APK / Fire TV / Samsung / LG
              </button>

              {/* Add Custom App */}
              <section>
                <h3 className="text-sm font-semibold text-white/90 mb-3">
                  Añadir acceso directo o enlace web
                </h3>
                <form
                  onSubmit={handleAddSubmit}
                  className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                >
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre (ej. IPTV Pro, Anime)"
                    className="w-full rounded-lg border border-white/10 bg-[#0B0E15] px-3.5 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                  />
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="Enlace opcional (https://...)"
                    className="w-full rounded-lg border border-white/10 bg-[#0B0E15] px-3.5 py-2 text-xs text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as AppCategory)}
                      className="rounded-lg border border-white/10 bg-[#0B0E15] px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="streaming">Streaming</option>
                      <option value="utilidades">Utilidades</option>
                      <option value="juegos">Juegos</option>
                    </select>
                    <div className="flex items-center gap-1.5">
                      {SHORTCUT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewColor(color)}
                          aria-label={`Color ${color}`}
                          style={{ backgroundColor: color }}
                          className={`h-5 w-5 rounded-full cursor-pointer transition-transform ${
                            newColor === color ? 'scale-125 ring-2 ring-white' : 'opacity-70'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-xs font-semibold text-[#0B0D12] hover:bg-white/90 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar a Favoritos
                  </button>
                </form>
              </section>

              {hiddenApps.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-white/90 mb-3">
                    Apps ocultas en este usuario ({hiddenApps.length})
                  </h3>
                  <div className="space-y-1.5">
                    {hiddenApps.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2.5"
                      >
                        <span className="text-sm text-white/85">{app.name}</span>
                        <button
                          type="button"
                          onClick={() => onRestoreHiddenApp(app.id)}
                          className="text-xs font-medium text-sky-400 hover:text-sky-300 cursor-pointer"
                        >
                          Restaurar
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* TAB 5: USUARIOS BLINDADOS Y SESIONES */}
          {section === 'usuarios' && (
            <>
              <section className="rounded-xl border border-cyan-400/25 bg-cyan-500/[0.06] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">
                    Sesiones blindadas ({users.length} perfiles)
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwitchUserLock();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#0B0D12] hover:bg-white/90 cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Cambiar / Bloquear
                  </button>
                </div>
                <p className="text-xs text-white/65 leading-relaxed">
                  Cada usuario tiene sus propios diseños, colores, apps ocultas y favoritos. Al
                  apagar o suspender la TV, la sesión se cierra automáticamente para proteger la
                  privacidad.
                </p>
              </section>

              {/* Edit Active User */}
              <section>
                <h3 className="text-sm font-semibold text-white/90 mb-3">
                  Configurar perfil actual ({activeUser.name})
                </h3>
                <form
                  onSubmit={handleSaveUserProfile}
                  className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                >
                  <div>
                    <label className="block text-xs text-white/65 mb-1">Nombre del perfil</label>
                    <input
                      type="text"
                      value={editUserName}
                      onChange={(e) => setEditUserName(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#0B0E15] px-3.5 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/65 mb-1">
                      PIN de 4 dígitos (vacío = acceso libre)
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={editUserPin}
                      onChange={(e) => setEditUserPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej. 1234"
                      className="w-full rounded-lg border border-white/10 bg-[#0B0E15] px-3.5 py-2 font-mono-tabular text-sm text-white focus:border-white/40 focus:outline-none"
                    />
                  </div>
                  <label className="flex items-center justify-between gap-3 pt-1 cursor-pointer">
                    <span className="text-xs text-white/85">
                      Cerrar sesión automáticamente al apagar/suspender la TV
                    </span>
                    <input
                      type="checkbox"
                      checked={activeUser.lockOnTvOff}
                      onChange={(e) => onUpdateActiveUser({ lockOnTvOff: e.target.checked })}
                      className="h-4 w-4 accent-cyan-400 cursor-pointer shrink-0"
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-white py-2 text-xs font-semibold text-[#0B0D12] hover:bg-white/90 cursor-pointer"
                  >
                    Guardar cambios del perfil
                  </button>
                </form>
              </section>

              {/* Create New Isolated User */}
              <section>
                <h3 className="text-sm font-semibold text-white/90 mb-3">
                  Crear nuevo usuario blindado
                </h3>
                <form
                  onSubmit={handleCreateNewUser}
                  className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                >
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Nombre (ej. Sala)"
                      className="rounded-lg border border-white/10 bg-[#0B0E15] px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none"
                    />
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={newUserPin}
                      onChange={(e) => setNewUserPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="PIN 4 dígitos"
                      className="rounded-lg border border-white/10 bg-[#0B0E15] px-3 py-2 font-mono-tabular text-xs text-white placeholder:text-white/40 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] py-2 text-xs font-semibold text-white hover:bg-white/12 cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Añadir sesión independiente
                  </button>
                </form>
              </section>

              {/* QR Share & Sleep Timer */}
              <section className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div>
                    <div className="text-sm font-semibold text-white">Enviar por QR / Enlace</div>
                    <div className="text-xs text-white/55">
                      Exporta el perfil activo a otro televisor
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenShareQr();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#0B0D12] cursor-pointer"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    Abrir QR
                  </button>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white/90">Temporizador / Protector OLED</span>
                    {sleepMinutesLeft !== null && (
                      <span className="font-mono-tabular text-cyan-300">
                        {sleepMinutesLeft} min
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[null, 15, 30, 60].map((mins) => (
                      <button
                        key={String(mins)}
                        type="button"
                        onClick={() => onSetSleepTimer(mins)}
                        className="rounded-lg border border-white/10 bg-white/[0.03] py-1.5 text-[11px] text-white/80 hover:bg-white/10 cursor-pointer"
                      >
                        {mins === null ? 'Apagado' : `${mins}m`}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenScreensaver();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-xs text-white/80 hover:bg-white/[0.06] cursor-pointer"
                  >
                    <Moon className="h-3.5 w-3.5" />
                    Activar reloj ambiental ahora
                  </button>
                </div>
              </section>

              <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between text-xs text-white/75 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Monitor className="h-3.5 w-3.5 text-white/50" />
                    Almacenamiento interno TV Box
                  </span>
                  <span className="font-mono-tabular">11.4 GB / 16.0 GB</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[71%] rounded-full bg-white/80" />
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] px-6 py-4">
          <button
            type="button"
            onClick={onResetUserDefaults}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-xs font-medium text-white/75 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restablecer perfil actual
          </button>
        </div>
      </aside>
    </div>
  );
};
