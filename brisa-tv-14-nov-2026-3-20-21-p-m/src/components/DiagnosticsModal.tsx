import React, { useEffect } from 'react';
import { Activity, CheckCircle2, Cpu, RefreshCw, Sparkles, Wifi, X } from 'lucide-react';
import { LAYOUT_PRESETS } from '../data/tvApps';
import { DiagnosticReport } from '../types/launcher';
import { DEVICE_PROFILES } from '../utils/tvOptimizer';

interface DiagnosticsModalProps {
  isOpen: boolean;
  report: DiagnosticReport | null;
  running: boolean;
  onRerun: () => void;
  onApplyRecommendation: (report: DiagnosticReport) => void;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  isOpen,
  report,
  running,
  onRerun,
  onApplyRecommendation,
  onClose,
}) => {
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

  const recDevice = report ? DEVICE_PROFILES[report.recommendedDevice] : null;
  const recPreset = report
    ? LAYOUT_PRESETS.find((p) => p.id === report.recommendedPreset)
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Autodiagnóstico del dispositivo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#06080C]/85 backdrop-blur-xl p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-white/12 bg-[#11151F] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Autodiagnóstico de Rendimiento y Red
              </h2>
              <p className="text-xs text-white/55">
                Medición en vivo al iniciar Tonalix TV
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

        {report ? (
          <div className="space-y-5">
            {/* Measured Telemetry Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-1.5 text-[11px] text-white/55">
                  <Cpu className="h-3.5 w-3.5 text-cyan-300" />
                  Respuesta CPU
                </div>
                <div className="font-mono-tabular mt-1.5 text-xl font-semibold text-white">
                  {report.cpuResponseMs} ms
                </div>
                <div className="mt-0.5 text-[11px] text-white/45">
                  {report.hardwareCores} núcleos
                  {report.deviceMemoryGb ? ` · ${report.deviceMemoryGb} GB` : ''}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-1.5 text-[11px] text-white/55">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  Ritmo de Cuadro
                </div>
                <div className="font-mono-tabular mt-1.5 text-xl font-semibold text-white">
                  {report.frameTimeMs} ms
                </div>
                <div className="mt-0.5 text-[11px] text-white/45">
                  ~{Math.min(120, Math.round(1000 / Math.max(8, report.frameTimeMs)))} FPS UI
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-1.5 text-[11px] text-white/55">
                  <Wifi className="h-3.5 w-3.5 text-emerald-300" />
                  Latencia Red
                </div>
                <div className="font-mono-tabular mt-1.5 text-xl font-semibold text-white">
                  {report.networkLatencyMs !== null ? `${report.networkLatencyMs} ms` : 'Offline'}
                </div>
                <div className="mt-0.5 text-[11px] text-white/45">
                  {report.networkOnline ? 'Conexión activa' : 'Sin conexión'}
                </div>
              </div>
            </div>

            {/* Recommendation Card */}
            <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/[0.07] p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-cyan-200">
                  Perfil recomendado automáticamente
                </span>
                <span className="font-mono-tabular text-[11px] text-white/75">
                  {recDevice?.shortLabel}
                </span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">{report.recommendedReason}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-white/65">
                <span>Diseño sugerido: {recPreset?.name}</span>
                <span>·</span>
                <span>
                  Turbo Light: {report.recommendedLowRam ? 'Activado' : 'Estándar 60fps'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={onRerun}
                disabled={running}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-white/85 hover:bg-white/10 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${running ? 'animate-spin' : ''}`} />
                {running ? 'Analizando...' : 'Volver a medir'}
              </button>

              <button
                type="button"
                onClick={() => {
                  onApplyRecommendation(report);
                  onClose();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-[#0B0D12] hover:bg-white/90 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                Aplicar perfil recomendado
              </button>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-white/60">
            Ejecutando análisis de procesador y latencia de red...
          </div>
        )}
      </div>
    </div>
  );
};
