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
 * Auth: the user's bearer token is forwarded on `POST /sessions` only.
 * After that the backend keys lookups by `session_id` in the URL path.
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";
import IdpDetails from "../../../rootApp/security/IdpDetails";

const authHeader = () => {
  const token = localStorage.getItem(IdpDetails.AuthTokenName);
  // avni-server expects the bearer token on the `AUTH-TOKEN` header (see
  // CognitoWebClient.jsx / KeycloakWebClient.jsx). Not `Authorization`.
  return token ? { "AUTH-TOKEN": token } : {};
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
      headers: authHeader(),
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
  sessionAlive: async (sessionId) => {
    try {
      const response = await fetch(`${baseUrl}/sessions/${sessionId}`, {
        method: "GET",
        credentials: "include",
      });
      return response.ok;
    } catch {
      return false;
    }
  },

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
    const response = await fetch(`${baseUrl}/sessions/${sessionId}/upload-to-avni`, { method: "POST", credentials: "include" });
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
 * React hook returning an autopilot client bound to the URL from Redux.
 * Memoized on `baseUrl` so callbacks downstream stay stable across renders.
 * Returns `null` until avni-server config arrives.
 */
export const useAiApi = () => {
  const baseUrl = useSelector((state) => state.app?.genericConfig?.avniAi?.mcpServerUrl);
  return useMemo(() => (baseUrl ? createAiApi(baseUrl) : null), [baseUrl]);
};
