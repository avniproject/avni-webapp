/**
 * Browser-side client for the avni-ai-web FastAPI service
 * (specs/AVNI_WEBAPP_INTEGRATION_SDD §4.1).
 *
 * Base URL is read from `window.ENV.AI_ASSISTANT_URL` so the same build
 * works against local dev, staging, and prod. Falls back to localhost
 * for unconfigured environments.
 *
 * Auth: the user's bearer token is forwarded on `POST /sessions` only.
 * After that the backend keys lookups by `session_id` in the URL path; the
 * `AI_SID` cookie the backend sets is used by the ALB for sticky routing.
 */

import IdpDetails from "../../../rootApp/security/IdpDetails";

const DEFAULT_BASE_URL = "http://localhost:8090";

export const getBaseUrl = () => (typeof window !== "undefined" && window.ENV && window.ENV.AI_ASSISTANT_URL) || DEFAULT_BASE_URL;

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

export const aiApi = {
  createSession: async () => {
    const response = await fetch(`${getBaseUrl()}/sessions`, {
      method: "POST",
      headers: authHeader(),
      credentials: "include",
    });
    return jsonOrThrow(response);
  },

  deleteSession: async (sessionId) => {
    await fetch(`${getBaseUrl()}/sessions/${sessionId}`, {
      method: "DELETE",
      credentials: "include",
    }).catch(() => {});
  },

  uploadFiles: async (sessionId, files) => {
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    const response = await fetch(`${getBaseUrl()}/sessions/${sessionId}/upload`, {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    return jsonOrThrow(response);
  },

  sendMessage: async (sessionId, text) => {
    const response = await fetch(`${getBaseUrl()}/sessions/${sessionId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      credentials: "include",
    });
    return jsonOrThrow(response);
  },

  resolve: async (sessionId, interruptId, resolutions) => {
    const response = await fetch(`${getBaseUrl()}/sessions/${sessionId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interrupt_id: interruptId, resolutions }),
      credentials: "include",
    });
    return jsonOrThrow(response);
  },

  uploadToAvni: async (sessionId) => {
    const response = await fetch(`${getBaseUrl()}/sessions/${sessionId}/upload-to-avni`, { method: "POST", credentials: "include" });
    return jsonOrThrow(response);
  },

  bundleUrl: (sessionId) => `${getBaseUrl()}/sessions/${sessionId}/bundle`,

  /**
   * Open the SSE stream. Returns an `EventSource` — caller attaches typed
   * listeners and is responsible for `close()` on unmount.
   */
  openEventStream: (sessionId) =>
    new EventSource(`${getBaseUrl()}/sessions/${sessionId}/events`, {
      withCredentials: true,
    }),
};
