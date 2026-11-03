'use client';

export interface TrackingEventLog {
  id: string;
  event: 'Lead' | 'ViewContent' | 'Contact' | 'InitiateCheckout';
  source: string;
  details: Record<string, unknown>;
  timestamp: string;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

const LOG_STORAGE_KEY = 'elohim_pixel_events_log';

export function getTrackingEventsLog(): TrackingEventLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function trackPixelAndGTM(
  event: TrackingEventLog['event'],
  source: string,
  details: Record<string, unknown> = {}
) {
  if (typeof window === 'undefined') return;

  // 1. Disparo de Meta Pixel (Facebook / Instagram Remarketing)
  if (typeof window.fbq === 'function') {
    window.fbq('track', event, {
      content_category: 'Motos',
      source,
      ...details,
    });
  }

  // 2. Disparo a Google Tag Manager dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: `elohim_${event.toLowerCase()}`,
    fb_standard_event: event,
    lead_source: source,
    ...details,
    timestamp: new Date().toISOString(),
  });

  // 3. Registro en consola y en el monitor de eventos del Admin
  const newLog: TrackingEventLog = {
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    event,
    source,
    details,
    timestamp: new Date().toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };

  try {
    const existing = getTrackingEventsLog();
    const updated = [newLog, ...existing].slice(0, 40);
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('elohim-tracking-event', { detail: newLog }));
  } catch {
    // ignore storage errors
  }
}

