import React from 'react';
import { MoreVertical } from 'lucide-react';
import { CardSize, IconShape, TvApp } from '../types/launcher';
import { AppBannerIcon } from './AppBannerIcon';

interface TvAppCardProps {
  app: TvApp;
  isFocused: boolean;
  cardSize: CardSize;
  iconShape?: IconShape;
  focusAccentColor?: string;
  reduceMotion?: boolean;
  layout?: 'row' | 'grid';
  onFocus: () => void;
  onLaunch: (app: TvApp) => void;
  onOpenOptions: (app: TvApp) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}

const BANNER_SIZE_CLASSES: Record<CardSize, { row: string; icon: 'sm' | 'md' | 'lg' }> = {
  compact: { row: 'w-[176px] sm:w-[192px]', icon: 'sm' },
  standard: { row: 'w-[216px] sm:w-[240px]', icon: 'md' },
  large: { row: 'w-[254px] sm:w-[286px]', icon: 'lg' },
};

const SQUARE_SIZE_CLASSES: Record<CardSize, { row: string; icon: 'sm' | 'md' | 'lg' }> = {
  compact: { row: 'w-[104px] sm:w-[116px]', icon: 'sm' },
  standard: { row: 'w-[122px] sm:w-[136px]', icon: 'md' },
  large: { row: 'w-[144px] sm:w-[160px]', icon: 'lg' },
};

export const TvAppCard: React.FC<TvAppCardProps> = ({
  app,
  isFocused,
  cardSize,
  iconShape = 'banner_16_9',
  focusAccentColor = '#22D3EE',
  reduceMotion = false,
  layout = 'row',
  onFocus,
  onLaunch,
  onOpenOptions,
  cardRef,
}) => {
  const isSquare = iconShape === 'tonalix_square';
  const sizeConfig = isSquare ? SQUARE_SIZE_CLASSES[cardSize] : BANNER_SIZE_CLASSES[cardSize];

  return (
    <div
      ref={cardRef}
      className={`group flex flex-col shrink-0 ${layout === 'row' ? sizeConfig.row : 'w-full'}`}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`Abrir ${app.name}`}
        onMouseEnter={onFocus}
        onFocus={onFocus}
        onClick={() => onLaunch(app)}
        onContextMenu={(e) => {
          e.preventDefault();
          onOpenOptions(app);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onLaunch(app);
          } else if (e.key === 'm' || e.key === 'M') {
            e.preventDefault();
            onOpenOptions(app);
          }
        }}
        style={{
          boxShadow: isFocused
            ? `0 0 0 2.5px ${focusAccentColor}, 0 18px 38px -12px rgba(0, 0, 0, 0.78), 0 0 24px -6px ${app.accentColor}45`
            : '0 8px 20px -10px rgba(0, 0, 0, 0.55)',
        }}
        className={`relative w-full overflow-hidden cursor-pointer focus:outline-none ${
          isSquare ? 'aspect-square rounded-2xl' : 'aspect-video rounded-xl'
        } ${
          reduceMotion ? '' : 'transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]'
        } ${
          isFocused
            ? reduceMotion
              ? 'z-10'
              : 'scale-[1.06] z-10'
            : 'ring-1 ring-white/10 hover:ring-white/30'
        }`}
      >
        <AppBannerIcon app={app} size={sizeConfig.icon} shape={iconShape} />

        {/* Subtle sheen on focus */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/[0.06] transition-opacity duration-150 ${
            isFocused ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Quick context options trigger */}
        <button
          type="button"
          aria-label={`Opciones de ${app.name}`}
          title="Opciones (M)"
          onClick={(e) => {
            e.stopPropagation();
            onOpenOptions(app);
          }}
          className={`absolute right-1.5 top-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-lg bg-black/55 text-white/85 backdrop-blur-md transition-opacity duration-150 hover:bg-black/80 hover:text-white cursor-pointer ${
            isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* App label below tile */}
      <div className={`mt-2 px-0.5 ${isSquare ? 'text-center' : ''}`}>
        <span
          className={`block truncate text-xs sm:text-sm font-medium transition-colors duration-150 ${
            isFocused ? 'text-white' : 'text-white/75'
          }`}
        >
          {app.name}
        </span>
      </div>
    </div>
  );
};
