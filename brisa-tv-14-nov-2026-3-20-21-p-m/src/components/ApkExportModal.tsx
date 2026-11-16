import React, { useEffect, useState } from 'react';
import { Check, Copy, Download, Package, Smartphone, Tv, X } from 'lucide-react';

type PlatformTarget = 'android_tv' | 'fire_tv' | 'samsung_tizen' | 'lg_webos';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CAPACITOR_CONFIG = `{
  "appId": "com.tonalix.tvlauncher",
  "appName": "Tonalix TV",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "backgroundColor": "#090B10"
  }
}`;

const ANDROID_MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-feature android:name="android.software.leanback" android:required="false" />
  <uses-feature android:name="android.hardware.touchscreen" android:required="false" />
  <uses-permission android:name="android.permission.INTERNET" />

  <application
    android:label="Tonalix TV"
    android:banner="@mipmap/ic_banner"
    android:theme="@style/Theme.AppCompat.NoActionBar">
    <activity
      android:name=".MainActivity"
      android:exported="true"
      android:launchMode="singleTask"
      android:screenOrientation="landscape">
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
        <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
        <category android:name="android.intent.category.HOME" />
        <category android:name="android.intent.category.DEFAULT" />
      </intent-filter>
    </activity>
  </application>
</manifest>`;

const SAMSUNG_TIZEN_CONFIG = `<?xml version="1.0" encoding="UTF-8"?>
<widget xmlns="http://www.w3.org/ns/widgets" xmlns:tizen="http://tizen.org/ns/widgets"
        id="http://tonalix.tv/launcher" version="1.0.0" viewmodes="maximized">
  <tizen:application id="tonalix001.TonalixTV" package="tonalix001" required_version="5.5"/>
  <content src="index.html"/>
  <feature name="http://tizen.org/feature/screen.size.normal.1080.1920"/>
  <icon src="icon.png"/>
  <name>Tonalix TV</name>
  <tizen:privilege name="http://tizen.org/privilege/tv.inputdevice"/>
  <tizen:privilege name="http://tizen.org/privilege/internet"/>
  <tizen:profile name="tv-samsung"/>
  <tizen:setting screen-orientation="landscape" context-menu="disable" background-support="disable" hwkey-event="enable"/>
</widget>`;

const LG_WEBOS_APPINFO = `{
  "id": "com.tonalix.tvlauncher",
  "version": "1.0.0",
  "vendor": "Tonalix TV",
  "type": "web",
  "main": "index.html",
  "title": "Tonalix TV",
  "icon": "icon.png",
  "largeIcon": "largeIcon.png",
  "resolution": "1920x1080",
  "disableBackHistoryAPI": true
}`;

export const ApkExportModal: React.FC<ApkExportModalProps> = ({ isOpen, onClose }) => {
  const [target, setTarget] = useState<PlatformTarget>('android_tv');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const downloadFile = (filename: string, content: string, mime = 'text/plain') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCommand = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(null);
    }
  };

  const androidBuildCommands = `npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap sync android
cd android && ./gradlew assembleRelease`;

  const fireTvSideloadCmd = `adb connect <IP_DE_TU_FIRE_TV>:5555
adb install -r app-release.apk
adb shell cmd package set-home-activity com.tonalix.tvlauncher/.MainActivity`;

  const samsungCommands = `npm run build
cp config.xml dist/
tizen package -t wgt -s <TU_CERTIFICADO> -- dist
tizen install -n TonalixTV.wgt -t <ID_SAMSUNG_TV>`;

  const webosCommands = `npm run build
cp appinfo.json dist/
ares-package dist
ares-install com.tonalix.tvlauncher_1.0.0_all.ipk -d <NOMBRE_LG_TV>`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Empaquetar Tonalix TV para Android TV, Fire TV y Smart TV"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#06080C]/88 backdrop-blur-xl p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-white/12 bg-[#11151F] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Exportar a APK / Fire TV / Samsung / LG
              </h2>
              <p className="text-xs text-white/55">
                Archivos listos para compilar el paquete nativo en cada Smart TV
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

        {/* Platform Tabs */}
        <div className="border-b border-white/[0.08] px-6 py-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-xl bg-white/[0.04] p-1">
            {(
              [
                { id: 'android_tv', label: 'Android TV (.APK)' },
                { id: 'fire_tv', label: 'Fire TV Stick' },
                { id: 'samsung_tizen', label: 'Samsung (.WGT)' },
                { id: 'lg_webos', label: 'LG webOS (.IPK)' },
              ] as { id: PlatformTarget; label: string }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTarget(item.id)}
                className={`rounded-lg py-2 px-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  target === item.id
                    ? 'bg-white text-[#0B0D12]'
                    : 'text-white/65 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-100/90 leading-relaxed">
            Nota técnica: el navegador web no puede compilar ni firmar binarios `.apk` o `.wgt` sin
            Android SDK / Tizen Studio local. Aquí puedes descargar los manifiestos configurados
            con soporte de Launcher (`LEANBACK_LAUNCHER` + `CATEGORY_HOME` + mando D-Pad) y copiar
            los comandos exactos para generar el instalador en tu PC.
          </div>

          {target === 'android_tv' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    downloadFile('capacitor.config.json', CAPACITOR_CONFIG, 'application/json')
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#0B0D12] hover:bg-white/90 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Descargar capacitor.config.json
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadFile('AndroidManifest.xml', ANDROID_MANIFEST, 'application/xml')
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/12 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Descargar AndroidManifest.xml (TV Home)
                </button>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#0A0D14] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-cyan-300" />
                    Comandos para compilar el APK (Android TV / Google TV / TV Box)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCommand('android', androidBuildCommands)}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] text-white hover:bg-white/20 cursor-pointer"
                  >
                    {copiedKey === 'android' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedKey === 'android' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <pre className="font-mono-tabular overflow-x-auto text-[11px] text-white/75 leading-relaxed">
                  {androidBuildCommands}
                </pre>
              </div>
            </div>
          )}

          {target === 'fire_tv' && (
            <div className="space-y-4">
              <p className="text-xs text-white/75 leading-relaxed">
                Amazon Fire TV Stick utiliza paquetes Android `.apk` estándar. Genera el APK desde
                la pestaña <strong>Android TV (.APK)</strong> (con el `AndroidManifest.xml`
                descargado) e instálalo en tu Fire TV Stick mediante ADB o la app{' '}
                <em>Downloader</em>:
              </p>

              <div className="rounded-xl border border-white/10 bg-[#0A0D14] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                    <Tv className="h-3.5 w-3.5 text-sky-400" />
                    Instalar APK y fijar como Inicio en Fire TV Stick
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCommand('fire', fireTvSideloadCmd)}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] text-white hover:bg-white/20 cursor-pointer"
                  >
                    {copiedKey === 'fire' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedKey === 'fire' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <pre className="font-mono-tabular overflow-x-auto text-[11px] text-white/75 leading-relaxed">
                  {fireTvSideloadCmd}
                </pre>
              </div>
            </div>
          )}

          {target === 'samsung_tizen' && (
            <div className="space-y-4">
              <p className="text-xs text-white/75 leading-relaxed">
                Los televisores Samsung (Tizen OS) utilizan paquetes web `.wgt` en lugar de `.apk`.
                Descarga el archivo `config.xml` configurado para Samsung Smart TV (1080p/4K + mando
                D-Pad) y empaquétalo con Tizen Studio CLI:
              </p>
              <button
                type="button"
                onClick={() =>
                  downloadFile('config.xml', SAMSUNG_TIZEN_CONFIG, 'application/xml')
                }
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#0B0D12] hover:bg-white/90 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Descargar config.xml (Samsung Tizen TV)
              </button>

              <div className="rounded-xl border border-white/10 bg-[#0A0D14] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/80">
                    Empaquetar e instalar en Samsung TV
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCommand('samsung', samsungCommands)}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] text-white hover:bg-white/20 cursor-pointer"
                  >
                    {copiedKey === 'samsung' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedKey === 'samsung' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <pre className="font-mono-tabular overflow-x-auto text-[11px] text-white/75 leading-relaxed">
                  {samsungCommands}
                </pre>
              </div>
            </div>
          )}

          {target === 'lg_webos' && (
            <div className="space-y-4">
              <p className="text-xs text-white/75 leading-relaxed">
                Para Smart TV LG (webOS), empaqueta el compilado web (`dist/`) junto con `appinfo.json`
                usando LG webOS CLI (`ares-package`) o instálalo en modo desarrollador:
              </p>
              <button
                type="button"
                onClick={() =>
                  downloadFile('appinfo.json', LG_WEBOS_APPINFO, 'application/json')
                }
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#0B0D12] hover:bg-white/90 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Descargar appinfo.json (LG webOS)
              </button>

              <div className="rounded-xl border border-white/10 bg-[#0A0D14] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/80">
                    Empaquetar e instalar en LG TV
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCommand('webos', webosCommands)}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] text-white hover:bg-white/20 cursor-pointer"
                  >
                    {copiedKey === 'webos' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedKey === 'webos' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <pre className="font-mono-tabular overflow-x-auto text-[11px] text-white/75 leading-relaxed">
                  {webosCommands}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
