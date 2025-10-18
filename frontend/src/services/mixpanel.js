import mixpanel from 'mixpanel-browser';
import { v4 as uuidv4 } from 'uuid';

const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;

if (mixpanelToken) {
  mixpanel.init(mixpanelToken, {
    debug: false, // Set to false for production
    track_pageview: true,
    persistence: 'localStorage',
  });
  
  // Check for an existing anonymous ID, or create a new one
  let distinct_id = localStorage.getItem('anonymous_id');
  if (!distinct_id) {
    distinct_id = uuidv4();
    localStorage.setItem('anonymous_id', distinct_id);
  }
  mixpanel.identify(distinct_id);
}

export const trackEvent = (eventName, properties = {}) => {
  if (mixpanelToken) {
    console.log(`[Mixpanel] Firing event: "${eventName}"`, properties); // <-- ADD THIS LINE
    mixpanel.track(eventName, properties);
  } else {
    console.log('[Mixpanel] Token not found. Analytics are disabled.'); // <-- ADD THIS LINE
  }
};
