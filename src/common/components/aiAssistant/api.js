/**
 * Browser-side client factory for the avni-autopilot FastAPI service
 * (specs/AVNI_WEBAPP_INTEGRATION_SDD §4.1).
 *
 * URL flows from avni-infra → avni-server → webapp:
 *   group_vars: avni_ai_server_url
 *     → appserver.conf.j2 sets AVNI_AI_SERVER_URL on the JVM (avni.mcp.server.url)
 *     → AuthDetailsController returns it as AvniAiConfig.mcpServerUrl
 *     → ducks.js stores it at state.app.genericConfig.avniAi.mcpServerUrl
 *
 * The `mcpServerUrl` field name is legacy — it was minted for the old avni-ai
 * MCP service. autopilot inherits the same URL slot until a rename ships in
 * avni-server. `avniAi.baseUrl` is avni-server's OWN URL, not the AI URL.
 *
 * Callers consume via `useAiApi()` (a hook) so the URL is resolved against
 * the live Redux state. Use `createAiApi(baseUrl)` directly only outside
 * React (e.g., in scripts or tests).
 *
 * Auth: the user's bearer token is forwarded on `POST /sessions` (session
 * creation) and `POST /upload-to-avni` (the backend relays it to
 * avni-server's /import/new, so it must be current — the token captured at
 * session creation may have expired during a long chat). All other
 * endpoints key lookups by `session_id` in the URL path.
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";
import IdpDetails from "../../../rootApp/security/IdpDetails";
import httpClient from "../../utils/httpClient";

const freshAuthHeader = async () => {
  // avni-server expects the bearer token on the `AUTH-TOKEN` header (see
  // CognitoWebClient.jsx / KeycloakWebClient.jsx). Not `Authorization`.
  // Ask the IDP client for the token (it refreshes an expired one before
  // handing it out) rather than reading localStorage, which can hold a
  // stale value when the assistant is the only activity in the tab.
  try {
    if (httpClient.idp) {
      const headers = new Headers();
      await httpClient.idp.updateRequestWithSession({ headers });
      const token = headers.get("AUTH-TOKEN");
      if (token) return { "AUTH-TOKEN": token };
    }
  } catch {
    /* fall through to the stored token */
  }
  const token = localStorage.getItem(IdpDetails.AuthTokenName);
  return token ? { "AUTH-TOKEN": token } : {};
};

const fetchSessionState = async (baseUrl, sessionId) => {
  try {
    const response = await fetch(`${baseUrl}/sessions/${sessionId}`, {
      method: "GET",
      credentials: "include",
    });
    return response.ok ? "alive" : "dead";
  } catch {
    return "unknown";
  }
};

const jsonOrThrow = async (response) => {
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const err = new Error(`HTTP ${response.status}: ${body || response.statusText}`);
    err.status = response.status;
    err.body = body;
    throw err;
  }
  return response.json();
};

export const createAiApi = (baseUrl) => ({
  createSession: async () => {
    const response = await fetch(`${baseUrl}/sessions`, {
      method: "POST",
      headers: await freshAuthHeader(),
      credentials: "include",
    });
    return jsonOrThrow(response);
  },

  deleteSession: async (sessionId) => {
    await fetch(`${baseUrl}/sessions/${sessionId}`, {
      method: "DELETE",
      credentials: "include",
    }).catch(() => {});
  },

  /** Cheap liveness check; false on 404 / network error. */
  sessionAlive: async (sessionId) => (await fetchSessionState(baseUrl, sessionId)) === "alive",

  /**
   * Like sessionAlive but distinguishes a definitively-gone session
   * ("dead": backend reachable and answered non-200) from a network
   * failure ("unknown") — callers must not discard a session over a blip.
   */
  sessionState: (sessionId) => fetchSessionState(baseUrl, sessionId),

  uploadFiles: async (sessionId, files) => {
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    const response = await fetch(`${baseUrl}/sessions/${sessionId}/upload`, {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    return jsonOrThrow(response);
  },

  sendMessage: async (sessionId, text) => {
    const response = await fetch(`${baseUrl}/sessions/${sessionId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      credentials: "include",
    });
    return jsonOrThrow(response);
  },

  resolve: async (sessionId, interruptId, resolutions) => {
    const response = await fetch(`${baseUrl}/sessions/${sessionId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interrupt_id: interruptId, resolutions }),
      credentials: "include",
    });
    return jsonOrThrow(response);
  },

  uploadToAvni: async (sessionId) => {
    const response = await fetch(`${baseUrl}/sessions/${sessionId}/upload-to-avni`, {
      method: "POST",
      headers: await freshAuthHeader(),
      credentials: "include",
    });
    return jsonOrThrow(response);
  },

  bundleUrl: (sessionId) => `${baseUrl}/sessions/${sessionId}/bundle`,

  uploadErrorLogUrl: (sessionId) => `${baseUrl}/sessions/${sessionId}/upload-error-log`,

  /**
   * Open the SSE stream. Returns an `EventSource` — caller attaches typed
   * listeners and is responsible for `close()` on unmount.
   */
  openEventStream: (sessionId) =>
    new EventSource(`${baseUrl}/sessions/${sessionId}/events`, {
      withCredentials: true,
    }),
});

/**
 * Optional dev override: when set, takes precedence over Redux. Use to point
 * a local webapp at a local autopilot while staying authenticated against a
 * staging avni-server. Set in DevTools and reload:
 *   localStorage.setItem("AI_ASSISTANT_URL_OVERRIDE", "http://localhost:8023")
 * Clear with `localStorage.removeItem("AI_ASSISTANT_URL_OVERRIDE")`.
 */
const _readLocalOverride = () => {
  try {
    return typeof window !== "undefined" ? window.localStorage.getItem("AI_ASSISTANT_URL_OVERRIDE") : null;
  } catch {
    return null;
  }
};

/**
 * React hook returning an autopilot client bound to the URL from Redux,
 * with an optional localStorage override for local dev.
 * Memoized on `baseUrl` so callbacks downstream stay stable across renders.
 * Returns `null` until either source produces a URL.
 */
export const useAiApi = () => {
  const reduxBaseUrl = useSelector((state) => state.app?.genericConfig?.avniAi?.mcpServerUrl);
  const baseUrl = _readLocalOverride() || reduxBaseUrl;
  return useMemo(() => (baseUrl ? createAiApi(baseUrl) : null), [baseUrl]);
};
