/**
 * Track a custom GoatCounter event.
 * Falls back silently if GoatCounter isn't loaded (localhost, ad blockers, etc.)
 *
 * Usage:
 *   trackEvent('trip_planned')
 *   trackEvent('trip_saved')
 */
export function trackEvent(eventName) {
  try {
    if (typeof window !== 'undefined' && window.goatcounter?.count) {
      window.goatcounter.count({ path: eventName, title: eventName, event: true });
    }
  } catch (_) {
    // Never crash the app over analytics
  }
}
