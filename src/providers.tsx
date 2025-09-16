import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  posthog.init("phc_yLIQYtQjgTZJOl7ocZC9b26ruoWQCGYkLKUaqvOZN8s", {
    //ok to be public https://posthog.com/docs/privacy#is-it-ok-for-my-api-key-to-be-exposed-and-public
    api_host: "https://eu.i.posthog.com",
    defaults: "2025-05-24",
    debug: import.meta.env.MODE === "development",
    capture_heatmaps: false,
    disable_session_recording: false,
    autocapture: {
      element_allowlist: ["a", "button", "form"],
    },
    before_send: (event) => {
      //required because we use hash routing
      if (event?.properties?.$current_url) {
        const parsedUrl = new URL(event.properties.$current_url);
        if (parsedUrl.hash) {
          event.properties.$pathname = parsedUrl.pathname + parsedUrl.hash;
        }
      }
      return event;
    },
    // loaded: (ph) => {
    //     if (import.meta.env.MODE === 'development') {
    //         ph.opt_out_capturing();
    //     }
    // }
  });
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
