import { SharedLauncherConfig } from '../types/launcher';

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64: string): string {
  const normalized = b64.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  const padded = pad ? normalized + '='.repeat(4 - pad) : normalized;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function encodeConfigToToken(config: SharedLauncherConfig): string {
  return toBase64Url(JSON.stringify(config));
}

export function buildShareUrl(config: SharedLauncherConfig): string {
  const token = encodeConfigToToken(config);
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?cfg=${token}`;
}

export function parseConfigFromInput(rawInput: string): SharedLauncherConfig | null {
  try {
    const trimmed = rawInput.trim();
    if (!trimmed) return null;

    let token = trimmed;
    if (trimmed.includes('cfg=')) {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://local.app/?${trimmed}`);
      token = url.searchParams.get('cfg') ?? '';
    }

    if (!token) return null;
    const decoded = fromBase64Url(token);
    const parsed = JSON.parse(decoded) as SharedLauncherConfig;
    if (parsed && parsed.v === 1 && parsed.settings && Array.isArray(parsed.pinnedIds)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function readConfigFromUrl(): SharedLauncherConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const cfg = params.get('cfg');
    if (!cfg) return null;
    return parseConfigFromInput(cfg);
  } catch {
    return null;
  }
}
