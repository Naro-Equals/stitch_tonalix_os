import {
  DeviceProfileId,
  DiagnosticReport,
  LayoutPresetId,
  NightModeConfig,
} from '../types/launcher';

export function isNightModeActive(config: NightModeConfig, now: Date = new Date()): boolean {
  if (!config.enabled) return false;
  if (config.forcePreview) return true;

  const parseMinutes = (hhmm: string): number => {
    const [hStr, mStr] = hhmm.split(':');
    const h = Number(hStr);
    const m = Number(mStr);
    if (Number.isNaN(h) || Number.isNaN(m)) return 0;
    return h * 60 + m;
  };

  const currentMins = now.getHours() * 60 + now.getMinutes();
  const startMins = parseMinutes(config.startTime);
  const endMins = parseMinutes(config.endTime);

  if (startMins === endMins) return false;
  if (startMins < endMins) {
    return currentMins >= startMins && currentMins < endMins;
  }
  // Overnight window (e.g. 21:00 -> 07:00)
  return currentMins >= startMins || currentMins < endMins;
}

function measureCpuLatencyMs(): number {
  const start = performance.now();
  let acc = 0;
  for (let i = 1; i <= 180000; i += 1) {
    acc += Math.sqrt(i) * (i % 7);
  }
  // Prevent dead-code elimination
  if (acc < 0) console.log(acc);
  return Number((performance.now() - start).toFixed(2));
}

function measureFrameTimeMs(): Promise<number> {
  return new Promise((resolve) => {
    const samples: number[] = [];
    let last = performance.now();
    let count = 0;

    const step = (now: number) => {
      samples.push(now - last);
      last = now;
      count += 1;
      if (count >= 6) {
        const valid = samples.slice(1);
        const avg = valid.reduce((a, b) => a + b, 0) / Math.max(1, valid.length);
        resolve(Number(avg.toFixed(1)));
      } else {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  });
}

async function measureNetworkLatencyMs(): Promise<{ latencyMs: number | null; online: boolean }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { latencyMs: null, online: false };
  }
  const start = performance.now();
  try {
    await fetch(`${window.location.origin}/?ping=${Date.now()}`, {
      method: 'HEAD',
      cache: 'no-store',
    });
    return { latencyMs: Math.round(performance.now() - start), online: true };
  } catch {
    const navConn = (navigator as unknown as { connection?: { rtt?: number } }).connection;
    if (navConn && typeof navConn.rtt === 'number' && navConn.rtt > 0) {
      return { latencyMs: navConn.rtt, online: true };
    }
    return { latencyMs: null, online: navigator.onLine };
  }
}

export async function runStartupDiagnostics(): Promise<DiagnosticReport> {
  const cpuResponseMs = measureCpuLatencyMs();
  const [frameTimeMs, net] = await Promise.all([
    measureFrameTimeMs(),
    measureNetworkLatencyMs(),
  ]);

  const hardwareCores =
    typeof navigator !== 'undefined' && navigator.hardwareConcurrency
      ? navigator.hardwareConcurrency
      : 4;

  const deviceMemoryRaw = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  const deviceMemoryGb = typeof deviceMemoryRaw === 'number' ? deviceMemoryRaw : null;

  let recommendedDevice: DeviceProfileId = 'xiaomi_box';
  let recommendedLowRam = false;
  let recommendedPreset: LayoutPresetId = 'tonalix_dock';
  let recommendedReason = '';

  const isLowMemory = deviceMemoryGb !== null && deviceMemoryGb <= 2;
  const isSlowCpu = cpuResponseMs > 18 || frameTimeMs > 24 || hardwareCores <= 2;
  const isVeryFast = cpuResponseMs < 7 && frameTimeMs <= 18 && hardwareCores >= 6 && !isLowMemory;

  if (isSlowCpu || (deviceMemoryGb !== null && deviceMemoryGb <= 1)) {
    recommendedDevice = 'fire_tv_lite';
    recommendedLowRam = true;
    recommendedPreset = 'solo_apps';
    recommendedReason = `Respuesta de CPU (${cpuResponseMs} ms) o memoria ajustada detectada. Se recomienda Fire TV Lite / Turbo Light sin animaciones pesadas.`;
  } else if (isLowMemory || cpuResponseMs > 11) {
    recommendedDevice = 'xiaomi_box';
    recommendedLowRam = true;
    recommendedPreset = 'tonalix_dock';
    recommendedReason = `Rendimiento equilibrado (${cpuResponseMs} ms CPU · ${frameTimeMs} ms/frame). Ideal para Tonalix Dock Turbo Light.`;
  } else if (isVeryFast) {
    recommendedDevice = 'shield_pro';
    recommendedLowRam = false;
    recommendedPreset = 'fire_tv';
    recommendedReason = `Procesador rápido (${cpuResponseMs} ms CPU · ${hardwareCores} núcleos) y red estable. Apto para diseños completos 4K 60fps.`;
  } else {
    recommendedDevice = 'fire_tv_4k';
    recommendedLowRam = false;
    recommendedPreset = 'leanback';
    recommendedReason = `Buena respuesta del procesador (${cpuResponseMs} ms) y latencia ${net.latencyMs ?? '—'} ms. Perfil Fire TV 4K / Google TV óptimo.`;
  }

  return {
    timestamp: Date.now(),
    cpuResponseMs,
    frameTimeMs,
    networkLatencyMs: net.latencyMs,
    networkOnline: net.online,
    hardwareCores,
    deviceMemoryGb,
    recommendedDevice,
    recommendedLowRam,
    recommendedPreset,
    recommendedReason,
  };
}
