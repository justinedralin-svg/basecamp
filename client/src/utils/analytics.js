/**
 * Track a custom GoatCounter event.
 * Queues events that fire before GoatCounter's async script has loaded.
 * Falls back silently if GoatCounter is blocked or unavailable.
 *
 * Usage:
 *   trackEvent('trip_planned')
 *   trackEvent('trip_saved')
 */
export function trackEvent(eventName) {
  try {
    if (typeof window === 'undefined') return;

    if (window.goatcounter?.count) {
      // GoatCounter is ready — fire immediately
      window.goatcounter.count({ path: eventName, title: eventName, event: true });
    } else {
      // GoatCounter hasn't loaded yet (async script) — queue it
      window._gcQueue = window._gcQueue || [];
      window._gcQueue.push(eventName);

      // Flush queue once GoatCounter loads
      if (!window._gcFlushInstalled) {
        window._gcFlushInstalled = true;
        window.addEventListener('load', () => {
          const flush = () => {
            if (!window.goatcounter?.count) return;
            (window._gcQueue || []).forEach(name => {
              window.goatcounter.count({ path: name, title: name, event: true });
            });
            window._gcQueue = [];
          };
          // Give GoatCounter a moment to initialise after load
          setTimeout(flush, 300);
        });
      }
    }
  } catch (_) {
    // Never crash the app over analytics
  }
}
