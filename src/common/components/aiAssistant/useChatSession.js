/**
 * React hook owning the avni-ai-web session lifecycle.
 *
 * Responsibilities:
 *  - Allocate a session on first user trigger (lazy — we don't burn a
 *    session id until the user opens the assistant).
 *  - Connect / reconnect the SSE EventSource; track every event by type.
 *  - Surface the running list of agent messages, pending HITL changes,
 *    bundle state, and the most recent error.
 *  - Expose stable callbacks: send, resolve, uploadFiles, uploadToAvni,
 *    downloadBundle, resetSession.
 *
 * The session id is mirrored to `sessionStorage` so a tab refresh resumes
 * the same backend session (SDD §5.3). The reaper on the backend drops
 * sessions after 30 min idle.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { aiApi } from "./api";
import { EVENT_TYPES } from "./types";

const SESSION_STORAGE_KEY = "avni-autopilot-session-id";

const readStoredSessionId = () => {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
};

const storeSessionId = (sid) => {
  try {
    if (sid) sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
    else sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    /* noop */
  }
};

/**
 * Mark the most recent assistant message as superseded by a structured
 * card (HITL confirmation or bundle-ready). The renderer skips messages
 * carrying `replacedByCard: true` so the same information isn't shown
 * twice. Returns the list unchanged when no assistant message is present.
 */
const collapseLastAssistantMessage = (messages) => {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") {
      if (messages[i].replacedByCard) return messages;
      const next = messages.slice();
      next[i] = { ...messages[i], replacedByCard: true };
      return next;
    }
  }
  return messages;
};

/** Try to extract FastAPI's `detail` object from an error response body. */
const safeParseDetail = (body) => {
  try {
    const parsed = JSON.parse(body);
    return parsed?.detail || parsed;
  } catch {
    return null;
  }
};

/**
 * @returns {{
 *   sessionId: string | null,
 *   orgName: string,
 *   status: "idle"|"connecting"|"connected"|"closed"|"error",
 *   messages: Array<{role: string, content: string, ts: string}>,
 *   toolCalls: Array<{tool: string, args: Object, call_id: string}>,
 *   pendingChanges: {interrupt_id: string, changes: Array} | null,
 *   bundle: {path: string, summary: Object} | null,
 *   uploadResult: {job_id: string, status: string, details?: string} | null,
 *   error: {code: string, message: string, recoverable: boolean} | null,
 *   start: () => Promise<void>,
 *   send: (text: string) => Promise<void>,
 *   resolveChanges: (resolutions: Array) => Promise<boolean>,
 *   uploadFiles: (files: File[]) => Promise<void>,
 *   uploadToAvni: () => Promise<void>,
 *   downloadBundleUrl: string | null,
 *   resetSession: () => Promise<void>,
 * }}
 */
export const useChatSession = () => {
  const [sessionId, setSessionId] = useState(readStoredSessionId);
  const [orgName, setOrgName] = useState("");
  const [status, setStatus] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [toolCalls, setToolCalls] = useState([]);
  const [pendingChanges, setPendingChanges] = useState(null);
  const [bundle, setBundle] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const eventSourceRef = useRef(null);

  // ── SSE wiring ────────────────────────────────────────────────────────────

  const handleEvent = useCallback((type, data) => {
    switch (type) {
      case EVENT_TYPES.AGENT_MESSAGE:
        setMessages((prev) => [...prev, { ...data }]);
        return;
      case EVENT_TYPES.TOOL_CALL:
        setToolCalls((prev) => [...prev, { ...data }]);
        return;
      case EVENT_TYPES.TOOL_RESULT:
        // Mark the corresponding tool_call as completed; the model's own
        // follow-up agent.message will narrate the result for the user.
        setToolCalls((prev) => prev.map((tc) => (tc.call_id === data.call_id ? { ...tc, result: data } : tc)));
        return;
      case EVENT_TYPES.HITL_PENDING:
        setPendingChanges(data);
        // Suppress the agent's prose enumeration of the same changes —
        // the structured card now owns that information. Only the most
        // recent assistant message is collapsed (the one the model just
        // emitted to introduce the interrupt).
        setMessages((prev) => collapseLastAssistantMessage(prev));
        return;
      case EVENT_TYPES.BUNDLE_READY:
        setBundle(data);
        // Same idea: the success card replaces the agent's text wrap-up.
        setMessages((prev) => collapseLastAssistantMessage(prev));
        return;
      case EVENT_TYPES.UPLOAD_DONE:
        setUploadResult(data);
        return;
      case EVENT_TYPES.ERROR:
        setError(data);
        if (!data.recoverable) setStatus("error");
        return;
      case EVENT_TYPES.SESSION_CLOSED:
        setStatus("closed");
        storeSessionId(null);
        return;
      default:
        // Unknown event type — log and ignore so a future backend addition
        // degrades gracefully.
        console.warn("avni-autopilot: unknown event type", type, data);
    }
  }, []);

  const connectStream = useCallback(
    (sid) => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      setStatus("connecting");
      const es = aiApi.openEventStream(sid);
      eventSourceRef.current = es;

      es.onopen = () => setStatus("connected");
      es.onerror = () => {
        // Browser will auto-retry; surface a transient error banner but
        // don't close the session — it may come back.
        setError({
          code: "E_SSE",
          message: "stream interrupted; retrying…",
          recoverable: true,
        });
      };

      // Attach a listener per event type so payloads are auto-routed.
      Object.values(EVENT_TYPES).forEach((eventType) => {
        es.addEventListener(eventType, (event) => {
          try {
            handleEvent(eventType, JSON.parse(event.data));
          } catch (err) {
            console.error("avni-autopilot: bad event payload", err, event);
          }
        });
      });
    },
    [handleEvent],
  );

  // ── Public API ────────────────────────────────────────────────────────────

  const start = useCallback(async () => {
    // Read the canonical session id from sessionStorage instead of the
    // React state closure. `resetSession` updates sessionStorage
    // synchronously but the React state setter may not have flushed by
    // the time `fullReset()` chains start() — without this we'd try to
    // reconnect to the just-deleted session id and fire E_SSE noise.
    const current = readStoredSessionId();
    if (current) {
      connectStream(current);
      return;
    }
    try {
      const { session_id, org_name } = await aiApi.createSession();
      storeSessionId(session_id);
      setSessionId(session_id);
      setOrgName(org_name);
      connectStream(session_id);
    } catch (err) {
      setError({
        code: "E_CREATE",
        message: err.message,
        recoverable: false,
      });
      setStatus("error");
    }
  }, [connectStream]);

  const send = useCallback(
    async (text) => {
      if (!sessionId || !text.trim()) return;
      try {
        await aiApi.sendMessage(sessionId, text);
        setMessages((prev) => [...prev, { role: "user", content: text, ts: new Date().toISOString() }]);
      } catch (err) {
        setError({
          code: "E_SEND",
          message: err.message,
          recoverable: true,
        });
      }
    },
    [sessionId],
  );

  const resolveChanges = useCallback(
    async (resolutions) => {
      if (!sessionId || !pendingChanges) return false;
      try {
        await aiApi.resolve(sessionId, pendingChanges.interrupt_id, resolutions);
        setPendingChanges(null);
        return true;
      } catch (err) {
        setError({
          code: "E_RESOLVE",
          message: err.message,
          recoverable: true,
        });
        return false;
      }
    },
    [sessionId, pendingChanges],
  );

  const uploadFiles = useCallback(
    async (files) => {
      if (!sessionId || !files?.length) return;
      try {
        await aiApi.uploadFiles(sessionId, files);
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content: `Uploaded ${files.length} file(s): ${[...files].map((f) => f.name).join(", ")}`,
            ts: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        setError({
          code: "E_UPLOAD",
          message: err.message,
          recoverable: true,
        });
      }
    },
    [sessionId],
  );

  const uploadToAvni = useCallback(async () => {
    if (!sessionId) return;
    try {
      const result = await aiApi.uploadToAvni(sessionId);
      setUploadResult(result);
    } catch (err) {
      // 404 here means either the session was reaped/lost (E_NO_SESSION)
      // or no bundle was captured on it (E_NO_BUNDLE). The former needs a
      // fresh session — see SDD §8.2 (in-memory sessions don't survive
      // backend restarts). Surface a clear instruction so users don't
      // get stuck staring at a generic 404.
      const detail = err.body ? safeParseDetail(err.body) : null;
      const code = detail?.code || "E_AVNI_UPLOAD";
      let message = err.message;
      if (code === "E_NO_SESSION") {
        message = "Session expired or the backend restarted. Click ↻ in the header to start a new session, then regenerate the bundle.";
      } else if (code === "E_NO_BUNDLE") {
        message = "No bundle to upload yet — generate one first by uploading scoping files and asking the assistant.";
      }
      setError({
        code,
        message,
        recoverable: err.status !== 401,
      });
    }
  }, [sessionId]);

  const resetSession = useCallback(async () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (sessionId) {
      await aiApi.deleteSession(sessionId);
    }
    storeSessionId(null);
    setSessionId(null);
    setOrgName("");
    setMessages([]);
    setToolCalls([]);
    setPendingChanges(null);
    setBundle(null);
    setUploadResult(null);
    setError(null);
    setStatus("idle");
  }, [sessionId]);

  // Clean up the EventSource on unmount.
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  return {
    sessionId,
    orgName,
    status,
    messages,
    toolCalls,
    pendingChanges,
    bundle,
    uploadResult,
    error,
    start,
    send,
    resolveChanges,
    uploadFiles,
    uploadToAvni,
    downloadBundleUrl: sessionId ? aiApi.bundleUrl(sessionId) : null,
    resetSession,
  };
};
