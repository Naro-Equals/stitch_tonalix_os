import React, { useEffect, useState } from 'react';
import {
  Bluetooth,
  Cpu,
  Gamepad2,
  Lock,
  Mic,
  Monitor,
  Power,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { LauncherSettings, LauncherTab, UserProfile } from '../types/launcher';

interface TopBarProps {
  activeTab: LauncherTab;
  settings: LauncherSettings;
  activeUser: UserProfile;
  ramUsedMb: number;
  ramBudgetMb: number;
  isNightActive: boolean;
  onSelectTab: (tab: LauncherTab) => void;
  onOpenSearch: () => void;
  onTurboBoost: () => void;
  onToggleWifi: () => void;
  onToggleBluetooth: () => void;
  onToggleGameMode: () => void;
  onOpenFirewall: () => void;
  onOpenShareQr: () => void;
  onOpenDiagnostics: () => void;
  onOpenSettings: () => void;
  onLockSession: () => void;
  onPowerOffTv: () => void;
  onVoiceCommand: () => void;
  voiceListening?: boolean;
  focusedHeaderIndex: number | null;
}

const TABS: { id: LauncherTab; label: string }[] = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'aplicaciones', label: 'Aplicaciones' },
  { id: 'entradas', label: 'Entradas' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  settings,
  activeUser,
  ramUsedMb,
  ramBudgetMb,
  isNightActive,
  onSelectTab,
  onOpenSearch,
  onTurboBoost,
  onToggleWifi,
  onToggleBluetooth,
  onToggleGameMode,
  onOpenFirewall,
  onOpenShareQr,
  onOpenDiagnostics,
  onOpenSettings,
  onLockSession,
  onPowerOffTv,
  onVoiceCommand,
  voiceListening = false,
  focusedHeaderIndex,
}) => {
  const [timeStr, setTimeStr] = useState<string>(() => formatClock(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(formatClock(new Date()));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const qb = settings.quickBar;
  const effectiveAccent = isNightActive
    ? settings.nightMode.warmAccentColor
    : settings.accentColor;

  return (
    <header className="relative z-20 flex w-full flex-wrap items-center justify-between gap-4 px-6 pt-5 pb-3.5 md:px-12">
      {/* Zone 1: Brand Wordmark */}
      <button
        type="button"
        onClick={() => onSelectTab('inicio')}
        className="font-display text-xl font-semibold tracking-tight text-white/95 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-md px-1"
      >
        Tonalix TV
      </button>

      {/* Zone 2: Minimal Navigation Tabs */}
      <nav aria-label="Navegación principal" className="flex items-center gap-6 sm:gap-8">
        {TABS.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const isDpadFocused = focusedHeaderIndex === idx;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              style={isDpadFocused ? { boxShadow: `0 0 0 2px ${effectiveAccent}` } : undefined}
              className={`relative py-2 text-sm sm:text-base font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none ${
                isActive ? 'text-white' : 'text-white/55 hover:text-white/85'
              } ${isDpadFocused ? 'rounded-lg px-3 -mx-3 bg-white/10 text-white' : ''}`}
            >
              {tab.label}
              {isActive && (
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: effectiveAccent }}
                  className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Configurable Quick Bar + Session Lock + Power + Clock */}
      <div className="flex items-center gap-2 shrink-0">
        {qb.showSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Buscar aplicaciones"
            title="Buscar (/)"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors cursor-pointer ${
              focusedHeaderIndex === 3
                ? 'bg-white text-[#0B0D12]'
                : 'bg-white/[0.06] text-white/80 hover:bg-white/15 hover:text-white'
            }`}
          >
            <Search className="h-4 w-4" />
          </button>
        )}

        {qb.showTurboBoost && (
          <button
            type="button"
            onClick={onTurboBoost}
            aria-label="Turbo Boost RAM"
            title="Liberar RAM ahora (Turbo Boost)"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 transition-colors cursor-pointer"
          >
            <Zap className="h-4 w-4" />
          </button>
        )}

        {qb.showGameMode && (
          <button
            type="button"
            onClick={onToggleGameMode}
            aria-label="Modo Juego"
            title={settings.gameMode ? 'Modo Juego activo' : 'Activar Modo Juego'}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors cursor-pointer ${
              settings.gameMode
                ? 'bg-violet-500/25 text-violet-300 ring-1 ring-violet-400/50'
                : 'bg-white/[0.06] text-white/75 hover:bg-white/15 hover:text-white'
            }`}
          >
            <Gamepad2 className="h-4 w-4" />
          </button>
        )}

        {qb.showDistanceInputs && (
          <button
            type="button"
            onClick={() => onSelectTab('entradas')}
            aria-label="Entradas HDMI y distancia"
            title={`TV ${settings.calibration.tvInches}" · ${settings.calibration.viewingDistanceM.toFixed(1)} m`}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-white/75 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
          >
            <Monitor className="h-4 w-4" />
          </button>
        )}

        {qb.showRamHealth && (
          <button
            type="button"
            onClick={onOpenDiagnostics}
            title={`Autodiagnóstico · RAM ${ramUsedMb} / ${ramBudgetMb} MB`}
            className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1.5 font-mono-tabular text-[11px] text-white/75 hover:bg-white/12 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <Cpu className="h-3.5 w-3.5 text-cyan-300" />
            {ramUsedMb} MB
          </button>
        )}

        {qb.showFirewall && (
          <button
            type="button"
            onClick={onOpenFirewall}
            aria-label="Seguridad y Firewall"
            title="Seguridad y Firewall"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors cursor-pointer ${
              settings.firewallEnabled
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'bg-white/[0.06] text-white/60 hover:bg-white/15'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
          </button>
        )}

        {qb.showWifi && (
          <button
            type="button"
            onClick={onToggleWifi}
            aria-label={settings.wifiConnected ? 'Wi-Fi conectado' : 'Wi-Fi desconectado'}
            title={settings.wifiConnected ? 'Wi-Fi 5GHz activo' : 'Wi-Fi desactivado'}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-white/75 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
          >
            {settings.wifiConnected ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4 text-amber-400" />
            )}
          </button>
        )}

        {qb.showBluetooth && (
          <button
            type="button"
            onClick={onToggleBluetooth}
            aria-label="Bluetooth"
            title={settings.bluetoothConnected ? 'Bluetooth activo' : 'Bluetooth apagado'}
            className={`hidden md:flex h-9 w-9 items-center justify-center rounded-full transition-colors cursor-pointer ${
              settings.bluetoothConnected
                ? 'bg-white/[0.06] text-sky-300 hover:bg-white/15'
                : 'bg-white/[0.04] text-white/40 hover:bg-white/10'
            }`}
          >
            <Bluetooth className="h-4 w-4" />
          </button>
        )}

        {qb.showShareQr && (
          <button
            type="button"
            onClick={onOpenShareQr}
            aria-label="Enviar por QR o enlace"
            title="Enviar por QR o enlace"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-white/80 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
          >
            <QrCode className="h-4 w-4" />
          </button>
        )}

        {qb.showVoiceCommand && (
          <button
            type="button"
            onClick={onVoiceCommand}
            aria-label={voiceListening ? 'Detener comando de voz' : 'Comando de voz'}
            title={voiceListening ? 'Escuchando…' : 'Di «Abre Netflix»'}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors cursor-pointer ${
              voiceListening
                ? 'bg-rose-500/30 text-rose-200 ring-1 ring-rose-400/60 animate-pulse'
                : 'bg-white/[0.06] text-white/80 hover:bg-white/15 hover:text-white'
            }`}
          >
            <Mic className="h-4 w-4" />
          </button>
        )}

        {/* Active Isolated User Switch / Lock */}
        <button
          type="button"
          onClick={onLockSession}
          aria-label={`Cambiar usuario (${activeUser.name})`}
          title={`Sesión: ${activeUser.name} · Clic para bloquear o cambiar`}
          className="flex h-9 items-center gap-2 rounded-full bg-white/[0.07] pl-1.5 pr-3 text-xs font-medium text-white/90 hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap"
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-[#07090D]"
            style={{ backgroundColor: activeUser.avatarColor }}
          >
            {activeUser.name.charAt(0).toUpperCase()}
          </span>
          <span className="hidden xl:inline max-w-[96px] truncate">{activeUser.name}</span>
          <Lock className="h-3 w-3 text-white/60" />
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Ajustes de Tonalix TV"
          title="Personalizar Tonalix TV"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-white/80 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
        >
          <Settings className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onPowerOffTv}
          aria-label="Apagar TV y cerrar sesión"
          title="Apagar TV (cierra la sesión actual)"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500/15 text-rose-300 hover:bg-rose-500/30 hover:text-rose-100 transition-colors cursor-pointer"
        >
          <Power className="h-4 w-4" />
        </button>

        {settings.showClock && (
          <time
            dateTime={timeStr}
            className="font-mono-tabular ml-1 text-base sm:text-lg font-medium tracking-tight text-white/90 whitespace-nowrap shrink-0"
          >
            {timeStr}
          </time>
        )}
      </div>
    </header>
  );
};

function formatClock(date: Date): string {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
