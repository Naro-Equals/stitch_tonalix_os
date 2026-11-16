import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Folder,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { TvApp } from '../types/launcher';
import { AppBannerIcon } from './AppBannerIcon';

interface AppLaunchModalProps {
  app: TvApp | null;
  onClose: () => void;
}

const SAMPLE_FILES = [
  { name: 'Peliculas_4K_HDR', type: 'Carpeta', size: '18.4 GB' },
  { name: 'USB_Kingston_128GB', type: 'Unidad externa', size: '112.0 GB' },
  { name: 'smarttube_stable_tv.apk', type: 'Paquete Android TV', size: '24.8 MB' },
  { name: 'Capturas_Pantalla', type: 'Carpeta', size: '140 MB' },
];

export const AppLaunchModal: React.FC<AppLaunchModalProps> = ({ app, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [ramFreed, setRamFreed] = useState<number | null>(null);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    setIsPlaying(true);
    setRamFreed(null);
    setCleaning(false);
  }, [app]);

  useEffect(() => {
    if (!app) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [app, onClose]);

  if (!app) return null;

  const handleRunCleaner = () => {
    setCleaning(true);
    setTimeout(() => {
      setCleaning(false);
      setRamFreed(486);
    }, 550);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={app.name}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#06080C]/92 backdrop-blur-2xl p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/12 bg-[#11151F] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner */}
        <div className="relative h-44 w-full overflow-hidden">
          <AppBannerIcon app={app} size="lg" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11151F] via-transparent to-black/30" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Volver al launcher"
            className="absolute right-4 top-4 flex h-9 items-center gap-2 rounded-lg bg-black/55 px-3 text-xs font-medium text-white/90 backdrop-blur-md hover:bg-black/80 cursor-pointer"
          >
            <X className="h-4 w-4" />
            Volver al inicio
          </button>
        </div>

        {/* Body */}
        <div className="px-7 pb-7 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">{app.name}</h2>
              <p className="mt-0.5 text-sm text-white/60">
                {app.customUrl ? app.customUrl : app.subtitle}
              </p>
            </div>

            {app.customUrl ? (
              <a
                href={app.customUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0B0D12] hover:bg-white/90 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir enlace web
              </a>
            ) : (
              app.iconType !== 'cleaner' &&
              app.iconType !== 'files' && (
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0B0D12] hover:bg-white/90 transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 fill-current" />
                      Pausar sesión
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      Reanudar
                    </>
                  )}
                </button>
              )
            )}
          </div>

          {app.iconType === 'cleaner' ? (
            <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    {ramFreed
                      ? `Memoria optimizada: ${ramFreed} MB liberados`
                      : 'Procesos en segundo plano listos para cerrar'}
                  </p>
                  <p className="mt-1 text-xs text-white/55">
                    Mantiene el launcher fluido en TV Box con 1 o 2 GB de RAM.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunCleaner}
                  disabled={cleaning}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-[#06120E] hover:bg-emerald-400 disabled:opacity-60 transition-colors cursor-pointer shrink-0"
                >
                  {ramFreed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Listo
                    </>
                  ) : cleaning ? (
                    <>
                      <RotateCcw className="h-4 w-4 animate-spin" />
                      Limpiando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Liberar memoria
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : app.iconType === 'files' ? (
            <div className="mt-6 divide-y divide-white/[0.07] rounded-xl border border-white/[0.08] bg-white/[0.02]">
              {SAMPLE_FILES.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Folder className="h-4 w-4 text-sky-400 shrink-0" />
                    <span className="truncate font-medium text-white/90">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/50 shrink-0">
                    <span>{item.type}</span>
                    <span className="font-mono-tabular text-white/70">{item.size}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm text-white/75">
              <span>
                {isPlaying
                  ? `Sesión activa en ${app.name} · Salida HDMI 4K`
                  : `Sesión en pausa en ${app.name}`}
              </span>
              <span className="font-mono-tabular text-xs text-white/50">Esc para regresar</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
