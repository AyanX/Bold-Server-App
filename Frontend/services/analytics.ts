import { api } from './api';

// Generate or retrieve session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Detect device type
function getDeviceType(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|webos|windows phone/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Detect browser
function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('MSIE') || ua.includes('Trident')) return 'IE';
  return 'Other';
}

// Detect OS
function getOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) return 'iOS';
  return 'Other';
}

// Track if we've already tracked this page in this session
const trackedPages = new Set<string>();

// Track a page view
export async function trackPageView(): Promise<void> {
  const pageKey = window.location.href;

  // Avoid duplicate tracking for the same page in quick succession
  if (trackedPages.has(pageKey)) {
    return;
  }

  trackedPages.add(pageKey);

  // Remove from set after 30 seconds to allow re-tracking if user returns
  setTimeout(() => {
    trackedPages.delete(pageKey);
  }, 30000);

  try {
    await api.analytics.trackPageView({
      session_id: getSessionId(),
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer || undefined,
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      screen_width: window.innerWidth,
    });
  } catch (error) {
    // Silently fail - analytics should not break the app
    console.debug('Analytics tracking failed:', error);
  }
}

// Initialize analytics - call once on app load
export function initAnalytics(): void {
  // Track initial page view
  trackPageView();

  // Track page views on hash change (for hash-based routing)
  window.addEventListener('hashchange', () => {
    trackPageView();
  });

  // Track page views on popstate (for history-based routing)
  window.addEventListener('popstate', () => {
    trackPageView();
  });
}

// Export session ID getter for other uses
export { getSessionId };
