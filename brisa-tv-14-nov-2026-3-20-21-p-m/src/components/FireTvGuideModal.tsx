import React, { useEffect, useState } from 'react';
import { Check, Copy, Shield, ShieldCheck, Terminal, Tv, X } from 'lucide-react';

interface FireTvGuideModalProps {
  mode: 'sideload' | 'firewall' | null;
  firewallEnabled: boolean;
  isDefaultLauncher: boolean;
  onToggleFirewall: (enabled: boolean) => void;
  onToggleDefaultLauncher: (isDefault: boolean) => void;
  onClose: () => void;
}

export const FireTvGuideModal: React.FC<FireTvGuideModalProps> = ({
  mode,
  firewallEnabled,
  isDefaultLauncher,
  onToggleFirewall,
  onToggleDefaultLauncher,
  onClose,
}) => {
  const [copiedCmd, setCopiedCmd] = useState(false);

  useEffect(() => {
    if (!mode) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, onClose]);

  if (!mode) return null;

  const adbCommand = 'adb shell cmd package set-home-activity com.tonalix.tvlauncher/.MainActivity';

  const handleCopyAdb = async () => {
    try {
      await navigator.clipboard.writeText(adbCommand);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } catch {
      setCopiedCmd(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#06080C]/85 backdrop-blur-xl p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-white/12 bg-[#11151F] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
              {mode === 'sideload' ? <Tv className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                {mode === 'sideload'
                  ? 'Guía Fire TV Stick / Sideload & Launcher'
                  : 'Seguridad y Firewall TV'}
              </h2>
              <p className="text-xs text-white/55">
                {mode === 'sideload'
                  ? 'Configura Tonalix TV en Amazon Fire OS o Android TV Box'
                  : 'Protección de red y bloqueo de telemetría en segundo plano'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {mode === 'sideload' ? (
          <div className="space-y-4">
            <div className="space-y-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs text-white/80 leading-relaxed">
              <p>
                <strong className="text-white">1. Activar Depuración ADB:</strong> En tu Fire TV ve
                a <em>Mi Fire TV → Acerca de</em> y pulsa 7 veces sobre el nombre del dispositivo
                para habilitar Opciones de desarrollador y Depuración ADB.
              </p>
              <p>
                <strong className="text-white">2. Instalar con Downloader:</strong> Abre la app{' '}
                <em>Downloader</em>, habilita orígenes desconocidos e instala el paquete de Tonalix
                TV o usa Launcher Manager.
              </p>
              <p>
                <strong className="text-white">3. Fijar como Launcher Predeterminado:</strong>{' '}
                Ejecuta por ADB desde PC o móvil con Termux:
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#0A0D14] px-3.5 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <Terminal className="h-4 w-4 text-cyan-400 shrink-0" />
                <code className="font-mono-tabular truncate text-[11px] text-white/80">
                  {adbCommand}
                </code>
              </div>
              <button
                type="button"
                onClick={handleCopyAdb}
                className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-white/20 cursor-pointer shrink-0"
              >
                {copiedCmd ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedCmd ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <div>
                <div className="text-sm font-medium text-white">
                  Estado de Launcher Predeterminado
                </div>
                <div className="text-xs text-white/55">
                  {isDefaultLauncher
                    ? 'Tonalix TV intercepta el botón Inicio (Home)'
                    : 'Launcher nativo activo'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleDefaultLauncher(!isDefaultLauncher)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  isDefaultLauncher
                    ? 'bg-emerald-500 text-[#05130E]'
                    : 'bg-white text-[#0B0D12]'
                }`}
              >
                {isDefaultLauncher ? 'Predeterminado activo' : 'Establecer predeterminado'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-white">
                    Escudo Firewall & Anti-Telemetría
                  </div>
                  <div className="text-xs text-white/55">
                    Bloquea anuncios en pantalla de inicio y actualizaciones forzadas OTA
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleFirewall(!firewallEnabled)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer ${
                  firewallEnabled
                    ? 'bg-cyan-400 text-[#061217]'
                    : 'bg-white/10 text-white/75'
                }`}
              >
                {firewallEnabled ? 'Activo' : 'Desactivado'}
              </button>
            </div>

            <div className="divide-y divide-white/[0.07] rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-white/80">Bloqueo de banners promocionales Fire OS</span>
                <span className="font-mono-tabular text-emerald-400">
                  {firewallEnabled ? 'Filtrado' : 'Inactivo'}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-white/80">Aislamiento de sesiones entre usuarios</span>
                <span className="font-mono-tabular text-emerald-400">Blindado</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-white/80">DNS privado ligero sin rastreadores</span>
                <span className="font-mono-tabular text-white/70">dns.adguard-dns.com</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
