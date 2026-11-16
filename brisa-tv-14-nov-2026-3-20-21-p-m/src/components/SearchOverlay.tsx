import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { TvApp } from '../types/launcher';
import { AppBannerIcon } from './AppBannerIcon';

interface SearchOverlayProps {
  isOpen: boolean;
  apps: TvApp[];
  onClose: () => void;
  onLaunchApp: (app: TvApp) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  apps,
  onClose,
  onLaunchApp,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps.slice(0, 8);
    return apps.filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        app.subtitle.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q),
    );
  }, [apps, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, Math.max(0, results.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      onLaunchApp(results[selectedIndex]);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar aplicaciones"
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#06080C]/85 backdrop-blur-xl px-6 pt-16 md:pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#12151E] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Row */}
        <div className="flex items-center gap-4 border-b border-white/[0.08] px-6 py-4">
          <Search className="h-5 w-5 text-white/60 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar aplicaciones, juegos o utilidades..."
            className="w-full bg-transparent text-lg text-white placeholder:text-white/40 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              Limpiar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar búsqueda"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[420px] overflow-y-auto p-3">
          {results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-white/60">
                No se encontraron aplicaciones para «{query}».
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {results.map((app, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <li key={app.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => {
                        onLaunchApp(app);
                        onClose();
                      }}
                      className={`flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-white/12 text-white ring-1 ring-white/30'
                          : 'text-white/80 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-11 w-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
                          <AppBannerIcon app={app} size="sm" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-display text-sm font-semibold text-white">
                            {app.name}
                          </div>
                          <div className="truncate text-xs text-white/55">{app.subtitle}</div>
                        </div>
                      </div>
                      <ArrowRight
                        className={`h-4 w-4 shrink-0 transition-opacity ${
                          isSelected ? 'opacity-100 text-white' : 'opacity-0'
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
