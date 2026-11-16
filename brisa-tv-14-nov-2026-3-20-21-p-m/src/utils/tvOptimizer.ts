import { CardSize, ComputedTvMetrics, DeviceProfileId, IconShape, TvCalibration } from '../types/launcher';

export interface DeviceProfileSpec {
  id: DeviceProfileId;
  name: string;
  shortLabel: string;
  ramGb: number;
  osLabel: string;
  recommendedShape: IconShape;
  defaultLowRam: boolean;
  description: string;
}

export const DEVICE_PROFILES: Record<DeviceProfileId, DeviceProfileSpec> = {
  fire_tv_lite: {
    id: 'fire_tv_lite',
    name: 'Amazon Fire TV Stick Lite / HD',
    shortLabel: 'Fire TV Lite · 1 GB RAM',
    ramGb: 1.0,
    osLabel: 'Fire OS (Base Android)',
    recommendedShape: 'tonalix_square',
    defaultLowRam: true,
    description: 'Máxima ligereza, sin desenfoques pesados y ahorro estricto de RAM.',
  },
  fire_tv_4k: {
    id: 'fire_tv_4k',
    name: 'Amazon Fire TV Stick 4K / Max',
    shortLabel: 'Fire TV 4K · 2 GB RAM',
    ramGb: 2.0,
    osLabel: 'Fire OS 7/8',
    recommendedShape: 'banner_16_9',
    defaultLowRam: false,
    description: 'Equilibrio para streaming 4K HDR con filas rápidas estilo Fire TV.',
  },
  google_tv: {
    id: 'google_tv',
    name: 'Chromecast con Google TV 4K',
    shortLabel: 'Google TV · 2 GB RAM',
    ramGb: 2.0,
    osLabel: 'Android TV 12',
    recommendedShape: 'banner_16_9',
    defaultLowRam: false,
    description: 'Diseño Leanback fluido con halo ambiental optimizado.',
  },
  xiaomi_box: {
    id: 'xiaomi_box',
    name: 'Xiaomi Mi Box / Onn 4K / TV Box',
    shortLabel: 'TV Box · 1.5–2 GB RAM',
    ramGb: 1.5,
    osLabel: 'Android TV 11/12',
    recommendedShape: 'tonalix_square',
    defaultLowRam: true,
    description: 'Dock Tonalix Turbo Light optimizado para boxes con memoria ajustada.',
  },
  shield_pro: {
    id: 'shield_pro',
    name: 'Nvidia Shield / Smart TV Gama Alta',
    shortLabel: 'Shield Pro · 3+ GB RAM',
    ramGb: 3.0,
    osLabel: 'Android TV 64-bit',
    recommendedShape: 'banner_16_9',
    defaultLowRam: false,
    description: 'Máxima densidad de columnas, animaciones 60fps y efectos completos.',
  },
};

export function computeTvMetrics(cal: TvCalibration): ComputedTvMetrics {
  const inches = Math.min(98, Math.max(22, cal.tvInches));
  const distanceM = Math.min(6.0, Math.max(0.8, cal.viewingDistanceM));
  const device = DEVICE_PROFILES[cal.deviceProfile] ?? DEVICE_PROFILES.xiaomi_box;

  const widthMeters = inches * 0.0254 * 0.87157;
  const fovRadians = 2 * Math.atan(widthMeters / 2 / distanceM);
  const fovDegrees = Number(((fovRadians * 180) / Math.PI).toFixed(1));

  let columns = 5;
  let cardSize: CardSize = 'standard';
  let uiScale = 1;
  let comfortLabel = 'Equilibrio óptimo 10-foot';

  if (fovDegrees < 16) {
    columns = 3;
    cardSize = 'large';
    uiScale = 1.12;
    comfortLabel = 'Lectura ampliada (TV pequeña o distancia larga)';
  } else if (fovDegrees < 22) {
    columns = 4;
    cardSize = 'large';
    uiScale = 1.06;
    comfortLabel = 'Visibilidad cómoda (alta legibilidad)';
  } else if (fovDegrees < 30) {
    columns = 5;
    cardSize = 'standard';
    uiScale = 1.0;
    comfortLabel = 'Equilibrio óptimo Android / Fire TV';
  } else if (fovDegrees < 38) {
    columns = 6;
    cardSize = 'standard';
    uiScale = 0.96;
    comfortLabel = 'Inmersión amplia (más iconos visibles)';
  } else {
    columns = 6;
    cardSize = 'compact';
    uiScale = 0.94;
    comfortLabel = 'Gran formato (máxima densidad)';
  }

  if (cal.resolution === '720p' && columns > 4) {
    columns = 4;
    cardSize = 'large';
    uiScale = Math.max(uiScale, 1.05);
  }

  // Device RAM optimization
  const reduceMotion = cal.lowRamMode || device.ramGb <= 1.5;
  const ramBudgetMb = device.ramGb <= 1 ? 240 : device.ramGb <= 1.5 ? 310 : device.ramGb <= 2 ? 420 : 680;
  if (device.ramGb <= 1 && columns > 5) {
    columns = 5;
  }

  const sizeLabel =
    cardSize === 'large' ? 'Grandes' : cardSize === 'compact' ? 'Compactas' : 'Estándar';

  const summary = `${device.shortLabel} · TV ${inches}" a ${distanceM.toFixed(1)} m (${fovDegrees}°): ${columns} columnas, tarjetas ${sizeLabel}, escala ${Math.round(uiScale * 100)}%.`;

  return {
    fovDegrees,
    columns,
    cardSize,
    iconShape: device.recommendedShape,
    uiScale,
    ramBudgetMb,
    reduceMotion,
    comfortLabel,
    summary,
  };
}
