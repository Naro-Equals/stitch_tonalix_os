import React from 'react';
import {
  Compass,
  Download,
  FolderOpen,
  Gamepad2,
  Globe,
  HardDrive,
  MonitorPlay,
  Music2,
  Play,
  Radio,
  Settings,
  ShieldCheck,
  Sparkles,
  Tv,
  Video,
  Zap,
} from 'lucide-react';
import { IconShape, TvApp } from '../types/launcher';

interface AppBannerIconProps {
  app: TvApp;
  size?: 'sm' | 'md' | 'lg';
  shape?: IconShape;
}

export const AppBannerIcon: React.FC<AppBannerIconProps> = ({
  app,
  size = 'md',
  shape = 'banner_16_9',
}) => {
  const iconSize = size === 'sm' ? 22 : size === 'lg' ? 36 : 28;
  const isSquare = shape === 'tonalix_square';

  const renderMark = () => {
    switch (app.iconType) {
      case 'youtube':
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-14 items-center justify-center rounded-xl bg-[#FF0033] shadow-sm">
              <Play className="h-5 w-5 fill-white text-white ml-0.5" />
            </div>
            {!isSquare && (
              <span className="font-display text-lg font-bold tracking-tight text-white">
                YouTube
              </span>
            )}
          </div>
        );

      case 'ytmusic':
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF0033] ring-2 ring-white/25">
              <Play className="h-4 w-4 fill-white text-white ml-0.5" />
            </div>
            {!isSquare && (
              <span className="font-display text-base font-bold tracking-tight text-white">
                YT Music
              </span>
            )}
          </div>
        );

      case 'smarttube':
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-12 items-center justify-center rounded-xl bg-[#E11D48]/20 border border-[#E11D48]/50">
              <Play className="h-5 w-5 fill-[#FB7185] text-[#FB7185] ml-0.5" />
            </div>
            {!isSquare && (
              <span className="font-display text-lg font-semibold tracking-tight text-white">
                SmartTube
              </span>
            )}
          </div>
        );

      case 'netflix':
        return (
          <div className="flex items-center gap-2">
            <span className="font-display text-3xl font-extrabold tracking-tighter text-[#E50914]">
              N
            </span>
            {!isSquare && (
              <span className="font-display text-base font-semibold tracking-widest text-white/95 uppercase">
                Netflix
              </span>
            )}
          </div>
        );

      case 'prime':
        return (
          <div className="flex flex-col items-center">
            <span className="font-display text-base font-semibold tracking-tight text-white">
              {isSquare ? 'prime' : 'prime video'}
            </span>
            <svg className="mt-0.5 h-2.5 w-14 text-[#00A8E1]" viewBox="0 0 80 14" fill="none">
              <path
                d="M4 3C22 13 54 13 74 3"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M68 1L76 3L72 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );

      case 'vix':
        return (
          <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B1A] to-[#FF3D00] px-3.5 py-1.5 shadow-sm">
            <span className="font-display text-xl font-extrabold tracking-tight text-white">
              ViX
            </span>
          </div>
        );

      case 'claro':
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-display text-lg font-bold text-[#EF4444]">Claro</span>
            {!isSquare && (
              <span className="font-display text-base font-medium text-white">video</span>
            )}
          </div>
        );

      case 'azteca':
        return (
          <div className="flex items-center gap-2">
            <Tv className="h-6 w-6 text-[#A78BFA]" />
            {!isSquare && (
              <span className="font-display text-base font-bold text-white">TV Azteca</span>
            )}
          </div>
        );

      case 'tubi':
        return (
          <div className="rounded-xl bg-[#7E22CE] px-3 py-1">
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              tubi
            </span>
          </div>
        );

      case 'xbox':
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#107C10]">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            {!isSquare && (
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Xbox
              </span>
            )}
          </div>
        );

      case 'disney':
        return (
          <div className="flex items-center gap-1">
            <span className="font-display text-lg font-bold tracking-tight text-white">
              {isSquare ? 'D' : 'Disney'}
            </span>
            <span className="font-display text-xl font-bold text-[#38BDF8]">+</span>
          </div>
        );

      case 'max':
        return (
          <span className="font-display text-2xl font-extrabold tracking-tight text-white">
            max
          </span>
        );

      case 'stremio':
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8A5CF5]/25 border border-[#8A5CF5]/50">
              <Play className="h-5 w-5 fill-[#A78BFA] text-[#A78BFA] ml-0.5" />
            </div>
            {!isSquare && (
              <span className="font-display text-lg font-semibold tracking-tight text-white">
                Stremio
              </span>
            )}
          </div>
        );

      case 'kodi':
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 rotate-45 items-center justify-center rounded-lg bg-[#17B2E7]/20 border border-[#17B2E7]/50">
              <Play className="-rotate-45 h-4 w-4 fill-[#38BDF8] text-[#38BDF8]" />
            </div>
            {!isSquare && (
              <span className="font-display text-lg font-semibold tracking-tight text-white ml-1">
                Kodi
              </span>
            )}
          </div>
        );

      case 'plex':
        return (
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-tight text-white">plex</span>
            <Play className="h-4 w-4 fill-[#E5A00D] text-[#E5A00D]" />
          </div>
        );

      case 'spotify':
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1DB954]">
              <Music2 className="h-5 w-5 text-[#090D12]" />
            </div>
            {!isSquare && (
              <span className="font-display text-lg font-semibold tracking-tight text-white">
                Spotify
              </span>
            )}
          </div>
        );

      case 'twitch':
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#9146FF]">
              <Radio className="h-5 w-5 text-white" />
            </div>
            {!isSquare && (
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Twitch
              </span>
            )}
          </div>
        );

      case 'pluto':
        return (
          <div className="flex items-center gap-2">
            <Tv className="h-6 w-6 text-[#F5C518]" />
            {!isSquare && (
              <span className="font-display text-lg font-bold tracking-tight text-white">
                pluto<span className="text-[#F5C518] font-medium ml-1">tv</span>
              </span>
            )}
          </div>
        );

      case 'vlc':
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF8800]/20 border border-[#FF8800]/50">
              <Video className="h-5 w-5 text-[#FF8800]" />
            </div>
            {!isSquare && (
              <span className="font-display text-lg font-semibold tracking-tight text-white">
                VLC
              </span>
            )}
          </div>
        );

      case 'files':
        return (
          <div className="flex items-center gap-2.5">
            <FolderOpen size={iconSize} className="text-[#38BDF8]" strokeWidth={1.8} />
            {!isSquare && (
              <span className="font-display text-base font-medium text-white">Archivos</span>
            )}
          </div>
        );

      case 'browser':
        return (
          <div className="flex items-center gap-2.5">
            <Compass size={iconSize} className="text-[#14B8A6]" strokeWidth={1.8} />
            {!isSquare && (
              <span className="font-display text-base font-medium text-white">Internet</span>
            )}
          </div>
        );

      case 'downloader':
        return (
          <div className="flex items-center gap-2.5">
            <Download size={iconSize} className="text-[#F97316]" strokeWidth={1.8} />
            {!isSquare && (
              <span className="font-display text-base font-medium text-white">Downloader</span>
            )}
          </div>
        );

      case 'cleaner':
        return (
          <div className="flex items-center gap-2.5">
            <Zap size={iconSize} className="text-[#34D399]" strokeWidth={1.8} />
            {!isSquare && (
              <span className="font-display text-base font-medium text-white">Turbo RAM</span>
            )}
          </div>
        );

      case 'firewall':
        return (
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={iconSize} className="text-[#22D3EE]" strokeWidth={1.8} />
            {!isSquare && (
              <span className="font-display text-base font-medium text-white">Firewall TV</span>
            )}
          </div>
        );

      case 'system_settings':
        return (
          <div className="flex items-center gap-2.5">
            <Settings size={iconSize} className="text-[#CBD5E1]" strokeWidth={1.8} />
            {!isSquare && (
              <span className="font-display text-base font-medium text-white">Sistema</span>
            )}
          </div>
        );

      case 'retroarch':
        return (
          <div className="flex items-center gap-2.5">
            <Gamepad2 size={iconSize} className="text-white" strokeWidth={1.8} />
            {!isSquare && (
              <span className="font-display text-base font-semibold text-white">RetroArch</span>
            )}
          </div>
        );

      case 'moonlight':
        return (
          <div className="flex items-center gap-2.5">
            <MonitorPlay size={iconSize} className="text-[#60A5FA]" strokeWidth={1.8} />
            {!isSquare && (
              <span className="font-display text-base font-semibold text-white">Moonlight</span>
            )}
          </div>
        );

      case 'steamlink':
        return (
          <div className="flex items-center gap-2.5">
            <HardDrive size={iconSize} className="text-[#38BDF8]" strokeWidth={1.8} />
            {!isSquare && (
              <span className="font-display text-base font-semibold text-white">Steam Link</span>
            )}
          </div>
        );

      case 'custom':
      default:
        return (
          <div className="flex items-center gap-2.5 px-3">
            {app.category === 'streaming' ? (
              <Sparkles size={iconSize - 4} style={{ color: app.accentColor }} />
            ) : (
              <Globe size={iconSize - 4} style={{ color: app.accentColor }} />
            )}
            {!isSquare && (
              <span className="font-display text-base font-semibold text-white truncate max-w-[140px]">
                {app.name}
              </span>
            )}
          </div>
        );
    }
  };

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${app.surfaceGradient}`}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: app.accentColor }}
      />
      <div className="relative z-10 flex items-center justify-center px-3">{renderMark()}</div>
    </div>
  );
};
