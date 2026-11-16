import React, { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, Download, Link2, QrCode, Upload, X } from 'lucide-react';
import { SharedLauncherConfig } from '../types/launcher';
import { buildShareUrl, parseConfigFromInput } from '../utils/configShare';

interface ShareQrModalProps {
  isOpen: boolean;
  config: SharedLauncherConfig;
  onClose: () => void;
  onImportConfig: (imported: SharedLauncherConfig) => void;
}

export const ShareQrModal: React.FC<ShareQrModalProps> = ({
  isOpen,
  config,
  onClose,
  onImportConfig,
}) => {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [mode, setMode] = useState<'export' | 'import'>('export');

  const shareUrl = useMemo(() => buildShareUrl(config), [config]);

  useEffect(() => {
    if (!isOpen) return;
    setCopied(false);
    setImportError(null);
    setImportSuccess(false);
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brisa-tv-perfil-${config.settings.layoutPreset}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    const parsed = parseConfigFromInput(importText);
    if (!parsed) {
      setImportError('El enlace o código no es válido. Verifica que esté completo.');
      return;
    }
    onImportConfig(parsed);
    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compartir configuración por QR o enlace"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#06080C]/85 backdrop-blur-xl p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/12 bg-[#11151F] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Enviar por QR o Enlace
              </h2>
              <p className="text-xs text-white/55">
                Lleva tu diseño, colores y calibración de TV a otro dispositivo
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

        {/* Mode switcher */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-white/[0.05] p-1">
          <button
            type="button"
            onClick={() => setMode('export')}
            className={`rounded-lg py-2 text-xs font-medium transition-colors cursor-pointer ${
              mode === 'export' ? 'bg-white text-[#0B0D12]' : 'text-white/70 hover:text-white'
            }`}
          >
            Enviar mi Launcher
          </button>
          <button
            type="button"
            onClick={() => setMode('import')}
            className={`rounded-lg py-2 text-xs font-medium transition-colors cursor-pointer ${
              mode === 'import' ? 'bg-white text-[#0B0D12]' : 'text-white/70 hover:text-white'
            }`}
          >
            Importar desde enlace
          </button>
        </div>

        {mode === 'export' ? (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-center gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="shrink-0 rounded-xl bg-white p-3 shadow-md">
                <QRCodeSVG value={shareUrl} size={148} level="M" bgColor="#FFFFFF" fgColor="#0B0D12" />
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <p className="text-sm font-medium text-white">
                  Escanea con tu móvil o TV Box
                </p>
                <p className="text-xs text-white/60 leading-relaxed">
                  Incluye el diseño activo ({config.settings.layoutPreset}), calibración (
                  {config.settings.calibration.tvInches}&quot; a{' '}
                  {config.settings.calibration.viewingDistanceM.toFixed(1)} m), colores y apps
                  fijadas.
                </p>
                <div className="pt-1 flex flex-wrap justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-[#0B0D12] hover:bg-white/90 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Enlace copiado' : 'Copiar enlace'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/85 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Respaldo JSON
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0B0E15] px-3.5 py-2.5 flex items-center gap-2.5">
              <Link2 className="h-4 w-4 text-white/45 shrink-0" />
              <input
                type="text"
                readOnly
                value={shareUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full bg-transparent font-mono-tabular text-xs text-white/70 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <p className="text-xs text-white/65 leading-relaxed">
              Pega aquí el enlace completo compartido desde otro televisor o móvil para aplicar su
              configuración al instante.
            </p>
            <textarea
              rows={4}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="https://.../?cfg=eyJ2Ijox..."
              className="w-full rounded-xl border border-white/12 bg-[#0B0E15] p-3.5 font-mono-tabular text-xs text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
            />
            {importError && <p className="text-xs text-rose-400">{importError}</p>}
            {importSuccess && (
              <p className="text-xs text-emerald-400">Configuración aplicada correctamente.</p>
            )}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-[#0B0D12] hover:bg-white/90 transition-colors cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              Aplicar configuración recibida
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
