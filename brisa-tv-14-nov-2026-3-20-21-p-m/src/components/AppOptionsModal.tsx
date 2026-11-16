import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, EyeOff, Pin, PinOff, Play, X } from 'lucide-react';
import { TvApp } from '../types/launcher';
import { AppBannerIcon } from './AppBannerIcon';

interface AppOptionsModalProps {
  app: TvApp | null;
  isPinned: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onClose: () => void;
  onLaunch: (app: TvApp) => void;
  onTogglePin: (appId: string) => void;
  onMove: (appId: string, direction: 'left' | 'right') => void;
  onHide: (appId: string) => void;
}

export const AppOptionsModal: React.FC<AppOptionsModalProps> = ({
  app,
  isPinned,
  canMoveLeft,
  canMoveRight,
  onClose,
  onLaunch,
  onTogglePin,
  onMove,
  onHide,
}) => {
  useEffect(() => {
    if (!app) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [app, onClose]);

  if (!app) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Opciones de ${app.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/12 bg-[#141822] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/15">
              <AppBannerIcon app={app} size="sm" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-base font-semibold text-white truncate">
                {app.name}
              </h3>
              <p className="text-xs text-white/55 truncate">{app.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLaunch(app);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
          >
            <Play className="h-4 w-4 fill-white" />
            Abrir aplicación
          </button>

          <button
            type="button"
            onClick={() => {
              onTogglePin(app.id);
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
          >
            {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            {isPinned ? 'Quitar de Favoritos' : 'Fijar en Favoritos'}
          </button>

          {isPinned && (
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                disabled={!canMoveLeft}
                onClick={() => onMove(app.id, 'left')}
                className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-white/85 bg-white/[0.04] hover:bg-white/10 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Mover izq.
              </button>
              <button
                type="button"
                disabled={!canMoveRight}
                onClick={() => onMove(app.id, 'right')}
                className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-white/85 bg-white/[0.04] hover:bg-white/10 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                Mover der.
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              onHide(app.id);
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-300/90 hover:bg-rose-500/15 hover:text-rose-200 transition-colors cursor-pointer"
          >
            <EyeOff className="h-4 w-4" />
            Ocultar del inicio
          </button>
        </div>
      </div>
    </div>
  );
};
