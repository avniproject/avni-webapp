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
 * Mark the most recent assistant message as superseded by an incoming card.
 * Only considers messages at/after `boundaryIndex` — a prior-round message
 * the user has already seen and acted on must not be retroactively hidden.
 * Bails on the first non-assistant message (any user action since the last
 * agent turn means nothing here is a duplicate of the new card).
 */
const collapseLatestAssistantMessage = (messages, boundaryIndex) => {
  for (let i = messages.length - 1; i >= boundaryIndex; i--) {
    if (messages[i].role !== "assistant") return messages;
    if (messages[i].replacedByCard) return messages;
    const next = messages.slice();
    next[i] = { ...messages[i], replacedByCard: true };
    return next;
  }
  return messages;
};

/** One-line summary of the user's decisions, shown in chat after Apply. */
const DECISION_LABELS = { yes: "Yes", no: "No", edit: "Edit" };

const buildDecisionsSummary = (changes, resolutions) => {
  const byId = new Map(resolutions.map((r) => [r.change_id, r]));
  const parts = changes.map((c, i) => {
    const r = byId.get(c.change_id);
    const label = DECISION_LABELS[r?.decision] || r?.decision || "?";
    if (r?.decision === "edit" && r.value) {
      return `#${i + 1} ${label} → "${r.value}"`;
    }
    return `#${i + 1} ${label}`;
  });
  return {
    role: "user",
    content: `Applied ${changes.length} decision${changes.length === 1 ? "" : "s"}: ${parts.join(" · ")}`,
    ts: new Date().toISOString(),
  };
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
  // Watermark = messages.length after the last send / resolve / upload.
  // Bounds the search window for collapseLatestAssistantMessage.
  const lastUserActionRef = useRef(0);

  // Append one message and advance the user-action watermark. Used by
  // every send / resolve / upload path so a subsequent HITL card can't
  // retroactively collapse a pre-watermark assistant message.
  const appendUserActionMessage = useCallback((msg) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      lastUserActionRef.current = next.length;
      return next;
    });
  }, []);

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
        setMessages((prev) => collapseLatestAssistantMessage(prev, lastUserActionRef.current));
        return;
      case EVENT_TYPES.BUNDLE_READY:
        setBundle(data);
        setMessages((prev) => collapseLatestAssistantMessage(prev, lastUserActionRef.current));
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

      es.onopen = () => {
        setStatus("connected");
        // Clear the transient "stream interrupted; retrying…" banner once
        // the browser's auto-reconnect succeeds. Without this it lingers
        // even though the connection has healed.
        setError((prev) => (prev?.code === "E_SSE" ? null : prev));
      };
      es.onerror = () => {
        // Browser will auto-retry; surface a transient error banner but
        // don't close the session — it may come back. Cleared by `onopen`
        // on successful reconnect.
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
    // Read from sessionStorage rather than React state: resetSession
    // updates storage synchronously but the state setter may not have
    // flushed by the time fullReset chains start(), otherwise we'd
    // reconnect to the just-deleted id.
    const current = readStoredSessionId();
    if (current) {
      const alive = await aiApi.sessionAlive(current);
      if (alive) {
        connectStream(current);
        return;
      }
      storeSessionId(null);
      setSessionId(null);
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
        appendUserActionMessage({ role: "user", content: text, ts: new Date().toISOString() });
      } catch (err) {
        setError({
          code: "E_SEND",
          message: err.message,
          recoverable: true,
        });
      }
    },
    [sessionId, appendUserActionMessage],
  );

  const resolveChanges = useCallback(
    async (resolutions) => {
      if (!sessionId || !pendingChanges) return false;
      try {
        await aiApi.resolve(sessionId, pendingChanges.interrupt_id, resolutions);
        appendUserActionMessage(buildDecisionsSummary(pendingChanges.changes, resolutions));
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
    [sessionId, pendingChanges, appendUserActionMessage],
  );

  const uploadFiles = useCallback(
    async (files) => {
      if (!sessionId || !files?.length) return;
      try {
        await aiApi.uploadFiles(sessionId, files);
        appendUserActionMessage({
          role: "system",
          content: `Uploaded ${files.length} file(s): ${[...files].map((f) => f.name).join(", ")}`,
          ts: new Date().toISOString(),
        });
      } catch (err) {
        setError({
          code: "E_UPLOAD",
          message: err.message,
          recoverable: true,
        });
      }
    },
    [sessionId, appendUserActionMessage],
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
    lastUserActionRef.current = 0;
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
    uploadErrorLogUrl: sessionId ? aiApi.uploadErrorLogUrl(sessionId) : null,
    resetSession,
  };
};
