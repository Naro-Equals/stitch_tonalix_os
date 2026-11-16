import React, { useEffect, useState } from 'react';

interface OledPixelShiftProps {
  enabled: boolean;
  /** Amplitude in CSS pixels */
  amplitude?: number;
  /** Interval between shifts in ms */
  intervalMs?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Subtle periodic pixel-shift for OLED burn-in mitigation.
 * Shifts the whole UI shell by 0–N px without breaking focus layout.
 */
export const OledPixelShift: React.FC<OledPixelShiftProps> = ({
  enabled,
  amplitude = 2,
  intervalMs = 45000,
  children,
  className = '',
}) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    const tick = () => {
      const angles = [0, 1, 0, -1];
      const nextX = angles[Math.floor(Math.random() * angles.length)] * amplitude;
      const nextY = angles[Math.floor(Math.random() * angles.length)] * amplitude;
      setOffset({ x: nextX, y: nextY });
    };

    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, amplitude, intervalMs]);

  return (
    <div
      className={className}
      style={{
        transform: enabled ? `translate(${offset.x}px, ${offset.y}px)` : undefined,
        transition: 'transform 1.8s ease-in-out',
        willChange: enabled ? 'transform' : undefined,
      }}
    >
      {children}
    </div>
  );
};
