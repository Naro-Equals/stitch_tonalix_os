import { useCallback, useEffect, useRef, useState } from 'react';
import { TvApp } from '../types/launcher';

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractAppQuery(transcript: string): string {
  const cleaned = normalize(transcript);
  const prefixes = [
    'abre ',
    'abrir ',
    'lanza ',
    'lanzar ',
    'inicia ',
    'iniciar ',
    'pon ',
    'poner ',
    'quiero ',
    'reproduce ',
    'open ',
    'launch ',
    'start ',
  ];
  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      return cleaned.slice(prefix.length).trim();
    }
  }
  return cleaned;
}

export function matchAppByVoice(transcript: string, apps: TvApp[]): TvApp | null {
  const query = extractAppQuery(transcript);
  if (!query) return null;

  const scored = apps
    .map((app) => {
      const name = normalize(app.name);
      const subtitle = normalize(app.subtitle);
      let score = 0;
      if (name === query || subtitle === query) score = 100;
      else if (name.includes(query) || query.includes(name)) score = 80;
      else if (subtitle.includes(query)) score = 55;
      else {
        const tokens = query.split(' ');
        const hits = tokens.filter((t) => t.length > 2 && (name.includes(t) || subtitle.includes(t)));
        score = hits.length * 20;
      }
      return { app, score };
    })
    .filter((x) => x.score >= 40)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.app ?? null;
}

interface UseVoiceCommandsOptions {
  enabled: boolean;
  apps: TvApp[];
  onLaunchApp: (app: TvApp) => void;
  onStatus?: (message: string) => void;
}

export function useVoiceCommands({
  enabled,
  apps,
  onLaunchApp,
  onStatus,
}: UseVoiceCommandsOptions) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const appsRef = useRef(apps);
  const onLaunchRef = useRef(onLaunchApp);
  const onStatusRef = useRef(onStatus);

  useEffect(() => {
    appsRef.current = apps;
  }, [apps]);
  useEffect(() => {
    onLaunchRef.current = onLaunchApp;
  }, [onLaunchApp]);
  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);

  useEffect(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(Boolean(Ctor));
  }, []);

  const ensureMicPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        onStatusRef.current?.('Este dispositivo no permite micrófono.');
        setPermission('denied');
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermission('granted');
      return true;
    } catch {
      setPermission('denied');
      onStatusRef.current?.('Permiso de micrófono denegado.');
      return false;
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setListening(false);
  }, []);

  const startListening = useCallback(async () => {
    if (!enabled) return;
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      onStatusRef.current?.('Reconocimiento de voz no disponible en este navegador/TV.');
      return;
    }

    const ok = await ensureMicPermission();
    if (!ok) return;

    try {
      recognitionRef.current?.abort();
    } catch {
      // ignore
    }

    const recognition = new Ctor();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? '';
      if (!transcript) {
        onStatusRef.current?.('No se entendió el comando. Di «Abre Netflix».');
        return;
      }
      const match = matchAppByVoice(transcript, appsRef.current);
      if (match) {
        onStatusRef.current?.(`Voz: abriendo ${match.name}`);
        onLaunchRef.current(match);
      } else {
        onStatusRef.current?.(`No encontré «${transcript}». Prueba con el nombre exacto.`);
      }
    };

    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === 'not-allowed') {
        setPermission('denied');
        onStatusRef.current?.('Micrófono bloqueado. Actívalo en permisos del sistema.');
      } else if (event.error !== 'aborted') {
        onStatusRef.current?.(`Voz: ${event.error}`);
      }
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      onStatusRef.current?.('Escuchando… di «Abre Netflix»');
    } catch {
      setListening(false);
      onStatusRef.current?.('No se pudo iniciar el micrófono.');
    }
  }, [enabled, ensureMicPermission]);

  const toggleListening = useCallback(() => {
    if (listening) stopListening();
    else void startListening();
  }, [listening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  return {
    supported,
    listening,
    permission,
    startListening,
    stopListening,
    toggleListening,
    ensureMicPermission,
  };
}
