import { useEffect, useRef } from "react";
import { api } from "@/lib/apiClient";

/**
 * Tracks visitor behavior on landing pages and sends events to /lead-tracking/event.
 * Events: page_view, time_on_page, scroll, form_start
 */
export function useLandingPageTracking(slug: string | undefined) {
  const sessionId = useRef<string>("");
  const startTime = useRef(Date.now());
  const maxScroll = useRef(0);
  const timeSent = useRef(false);
  const formTracked = useRef(false);

  useEffect(() => {
    if (!slug) return;

    // Generate or reuse session ID
    const storageKey = `lp_session_${slug}`;
    let sid = sessionStorage.getItem(storageKey);
    if (!sid) {
      sid = `${slug}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(storageKey, sid);
    }
    sessionId.current = sid;
    startTime.current = Date.now();
    maxScroll.current = 0;
    timeSent.current = false;

    // Track page_view
    sendEvent("page_view", slug, {});

    // Scroll tracking
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const depth = Math.round((scrollTop / docHeight) * 100);
        if (depth > maxScroll.current) {
          maxScroll.current = depth;
        }
      }
    };

    // Send scroll + time on unload
    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      // Use sendBeacon for reliability on page close
      const baseUrl = localStorage.getItem("mogibens_api_url") || "";
      if (!baseUrl) return;

      const payload = (eventType: string, metadata: Record<string, unknown>) =>
        JSON.stringify({
          session_id: sessionId.current,
          event_type: eventType,
          landing_page_slug: slug,
          metadata,
        });

      try {
        navigator.sendBeacon(
          `${baseUrl}/lead-tracking/event`,
          new Blob([payload("time_on_page", { duration_seconds: duration })], { type: "application/json" })
        );
        if (maxScroll.current > 0) {
          navigator.sendBeacon(
            `${baseUrl}/lead-tracking/event`,
            new Blob([payload("scroll", { depth: maxScroll.current })], { type: "application/json" })
          );
        }
      } catch {
        /* silent */
      }
    };

    // Periodic time tracking (every 30s as backup)
    const timeInterval = setInterval(() => {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      if (duration >= 30 && !timeSent.current) {
        sendEvent("time_on_page", slug, { duration_seconds: duration });
        timeSent.current = true;
      }
    }, 30000);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handleUnload();
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleUnload);
      clearInterval(timeInterval);
    };
  }, [slug]);

  // Public: track form focus
  const trackFormStart = () => {
    if (formTracked.current || !slug) return;
    formTracked.current = true;
    sendEvent("form_start", slug, {});
  };

  // Public: track chat message
  const trackChatMessage = () => {
    if (!slug) return;
    sendEvent("chat_message", slug, {});
  };

  return { trackFormStart, trackChatMessage, sessionId: sessionId.current };
}

function sendEvent(eventType: string, slug: string, metadata: Record<string, unknown>) {
  const sid = sessionStorage.getItem(`lp_session_${slug}`) || "";
  api.post("/lead-tracking/event", {
    session_id: sid,
    event_type: eventType,
    landing_page_slug: slug,
    metadata,
  }).catch(() => {});
}
