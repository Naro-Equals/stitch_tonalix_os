import React, { useEffect, useState } from 'react';
import { WALLPAPERS } from '../data/tvApps';
import { WallpaperId } from '../types/launcher';

interface ScreensaverOverlayProps {
  isOpen: boolean;
  wallpaper: WallpaperId;
  pixelShift?: boolean;
  onExit: () => void;
}

export const ScreensaverOverlay: React.FC<ScreensaverOverlayProps> = ({
  isOpen,
  wallpaper,
  pixelShift = true,
  onExit,
}) => {
  const [now, setNow] = useState(() => new Date());
  const [shift, setShift] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setNow(new Date()), 5000);
    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault();
      onExit();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onExit]);

  useEffect(() => {
    if (!isOpen || !pixelShift) {
      setShift({ x: 0, y: 0 });
      return;
    }
    const tick = () => {
      const steps = [-3, -1, 0, 1, 3];
      setShift({
        x: steps[Math.floor(Math.random() * steps.length)],
        y: steps[Math.floor(Math.random() * steps.length)],
      });
    };
    tick();
    const id = window.setInterval(tick, 20000);
    return () => window.clearInterval(id);
  }, [isOpen, pixelShift]);

  if (!isOpen) return null;

  const wp = WALLPAPERS[wallpaper] ?? WALLPAPERS.obsidian;
  const timeStr = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const dateStr = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Salir del protector OLED"
      onClick={onExit}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-[#040507] p-10 md:p-16 cursor-pointer"
    >
      {wp.imageUrl && (
        <img
          src={wp.imageUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
          style={{
            transform: `translate(${shift.x}px, ${shift.y}px) scale(1.02)`,
            transition: 'transform 2.4s ease-in-out',
          }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20" />

      <div
        className="relative z-10 flex items-end justify-between gap-6"
        style={{
          transform: `translate(${shift.x}px, ${shift.y}px)`,
          transition: 'transform 2.4s ease-in-out',
        }}
      >
        <div>
          <div className="font-mono-tabular text-6xl sm:text-8xl font-medium tracking-tight text-white">
            {timeStr}
          </div>
          <p className="mt-2 text-base sm:text-lg capitalize text-white/70">{dateStr}</p>
          <p className="mt-3 text-[11px] text-cyan-300/70">Protector OLED · desplazamiento anti-retención</p>
        </div>
        <p className="text-xs text-white/45">Pulsa cualquier tecla o haz clic para volver</p>
      </div>
    </div>
  );
};
