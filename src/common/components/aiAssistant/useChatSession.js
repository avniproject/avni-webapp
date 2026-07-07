/**
 * React hook owning the avni-ai-web session lifecycle.
 *
 * Responsibilities:
 *  - Allocate a session on first user trigger (lazy — sessions aren't
 *    spent until the user opens the assistant).
 *  - Connect / reconnect the SSE EventSource; track every event by type.
 *  - Maintain the ordered conversation in `messages`. Per
 *    specs/INLINE_AUTOPILOT_CARDS_SDD.md, every interactive card
 *    (HITL pause, bundle ready, upload result) is a typed entry in this
 *    array, not a sidecar piece of state. That makes scrollback the
 *    authoritative record of the session and keeps cards in their
 *    chronological slot.
 *  - Expose stable callbacks: send, resolveChanges, uploadFiles,
 *    uploadToAvni, resetSession.
 *
 * The session id is mirrored to `sessionStorage` so a tab refresh resumes
 * the same backend session (SDD §5.3). The reaper on the backend drops
 * sessions after 30 min idle.
 *
 * Message shapes (specs/INLINE_AUTOPILOT_CARDS_SDD.md §3.1):
 *   { type: "text",   role, content, ts }
 *   { type: "hitl",   interrupt_id, changes, resolved, ts }
 *   { type: "bundle", path, summary, uploaded, ts }
 *   { type: "upload", job_id, status, details?, error_log_available?, ts }
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useAiApi } from "./api";
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

const nowTs = () => new Date().toISOString();

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
    type: "text",
    role: "user",
    content: `Applied ${changes.length} decision${changes.length === 1 ? "" : "s"}: ${parts.join(" · ")}`,
    ts: nowTs(),
  };
};

/** Flip `resolved: true` on the hitl message with the matching interrupt_id. */
const markHitlResolved = (messages, interruptId) =>
  messages.map((m) => (m.type === "hitl" && m.interrupt_id === interruptId ? { ...m, resolved: true } : m));

/**
 * Flip `uploaded: true` on the most recent bundle message. Called on a
 * successful upload.done so the inline BundleSummary's Upload button
 * disables itself; failed uploads leave it alone so the user can retry.
 */
const markLatestBundleUploaded = (messages) => {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].type === "bundle") {
      const next = messages.slice();
      next[i] = { ...messages[i], uploaded: true };
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
 *   messages: Array<Object>,
 *   toolCalls: Array<{tool: string, args: Object, call_id: string}>,
 *   error: {code: string, message: string, recoverable: boolean} | null,
 *   start: () => Promise<void>,
 *   send: (text: string) => Promise<void>,
 *   resolveChanges: (interruptId: string, resolutions: Array) => Promise<boolean>,
 *   uploadFiles: (files: File[]) => Promise<void>,
 *   uploadToAvni: () => Promise<void>,
 *   downloadBundleUrl: string | null,
 *   uploadErrorLogUrl: string | null,
 *   resetSession: () => Promise<void>,
 * }}
 */
export const useChatSession = () => {
  // Bound to state.app.genericConfig.avniAi.mcpServerUrl from Redux. `null`
  // until avni-server's config arrives; every callback below guards on it.
  const aiApi = useAiApi();

  const [sessionId, setSessionId] = useState(readStoredSessionId);
  const [orgName, setOrgName] = useState("");
  const [status, setStatus] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [toolCalls, setToolCalls] = useState([]);
  const [error, setError] = useState(null);
  const [checkingSetup, setCheckingSetup] = useState(false);

  const eventSourceRef = useRef(null);
  // Flag set when an interactive card (HITL / bundle) lands. The model's
  // very next agent.message restates what the card already shows, so it
  // gets stamped suppressed at append time and ChatPanel filters it out.
  // One-shot: cleared the moment a message is stamped.
  const suppressNextAssistantRef = useRef(false);

  // ── SSE wiring ────────────────────────────────────────────────────────────

  const handleEvent = useCallback((type, data) => {
    switch (type) {
      case EVENT_TYPES.AGENT_MESSAGE: {
        const suppressed = suppressNextAssistantRef.current;
        suppressNextAssistantRef.current = false;
        // The narration for any completed tool calls has arrived — drop
        // them so their progress rows stop showing.
        setToolCalls((prev) => prev.filter((tc) => !tc.result));
        setMessages((prev) => [...prev, { type: "text", ...data, suppressed }]);
        return;
      }
      case EVENT_TYPES.TOOL_CALL:
        // A new call supersedes completed ones from the same turn (tool
        // chains without narration in between).
        setToolCalls((prev) => [...prev.filter((tc) => !tc.result), { ...data }]);
        return;
      case EVENT_TYPES.TOOL_RESULT:
        // Mark the corresponding tool_call as completed. Its progress row
        // stays visible until the agent's follow-up message (or an inline
        // card) lands — for fast tools the model is still composing the
        // user-facing answer well after the tool returns.
        setToolCalls((prev) => prev.map((tc) => (tc.call_id === data.call_id ? { ...tc, result: data } : tc)));
        return;
      case EVENT_TYPES.HITL_PENDING:
        suppressNextAssistantRef.current = true;
        setToolCalls((prev) => prev.filter((tc) => !tc.result));
        setMessages((prev) => [
          ...prev,
          {
            type: "hitl",
            interrupt_id: data.interrupt_id,
            changes: data.changes,
            resolved: false,
            ts: nowTs(),
          },
        ]);
        return;
      case EVENT_TYPES.BUNDLE_READY:
        suppressNextAssistantRef.current = true;
        setToolCalls((prev) => prev.filter((tc) => !tc.result));
        setMessages((prev) => [
          ...prev,
          {
            type: "bundle",
            path: data.path,
            summary: data.summary,
            uploaded: false,
            ts: nowTs(),
          },
        ]);
        return;
      case EVENT_TYPES.UPLOAD_DONE:
        setMessages((prev) => {
          const withUpload = [
            ...prev,
            {
              type: "upload",
              job_id: data.job_id || "",
              status: data.status,
              details: data.details,
              error_log_available: data.error_log_available,
              ts: nowTs(),
            },
          ];
          return data.status === "ok" ? markLatestBundleUploaded(withUpload) : withUpload;
        });
        return;
      case EVENT_TYPES.ERROR:
        setError(data);
        // A failed or cancelled turn produces no narration — drop completed
        // tool calls so their progress rows don't spin forever.
        setToolCalls((prev) => prev.filter((tc) => !tc.result));
        if (!data.recoverable) setStatus("error");
        return;
      case EVENT_TYPES.SESSION_CLOSED:
        setStatus("closed");
        storeSessionId(null);
        return;
      case EVENT_TYPES.SESSION_LOADING:
        setCheckingSetup(true);
        return;
      case EVENT_TYPES.SESSION_READY:
        setCheckingSetup(false);
        return;
      default:
        // Unknown event type — log and ignore so a future backend addition
        // degrades gracefully.
        console.warn("avni-autopilot: unknown event type", type, data);
    }
  }, []);

  const connectStream = useCallback(
    (sid) => {
      if (!aiApi) return;
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
    [handleEvent, aiApi],
  );

  // ── Public API ────────────────────────────────────────────────────────────

  const start = useCallback(async () => {
    if (!aiApi) return;
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
  }, [connectStream, aiApi]);

  const send = useCallback(
    async (text) => {
      if (!aiApi || !sessionId || !text.trim()) return;
      try {
        await aiApi.sendMessage(sessionId, text);
        setMessages((prev) => [...prev, { type: "text", role: "user", content: text, ts: nowTs() }]);
      } catch (err) {
        setError({
          code: "E_SEND",
          message: err.message,
          recoverable: true,
        });
      }
    },
    [sessionId, aiApi],
  );

  const resolveChanges = useCallback(
    async (interruptId, resolutions) => {
      if (!aiApi || !sessionId || !interruptId) return false;
      try {
        await aiApi.resolve(sessionId, interruptId, resolutions);
        setMessages((prev) => {
          const target = prev.find((m) => m.type === "hitl" && m.interrupt_id === interruptId);
          const summary = target ? buildDecisionsSummary(target.changes, resolutions) : null;
          const flagged = markHitlResolved(prev, interruptId);
          return summary ? [...flagged, summary] : flagged;
        });
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
    [sessionId, aiApi],
  );

  const uploadFiles = useCallback(
    async (files) => {
      if (!aiApi || !sessionId || !files?.length) return;
      try {
        await aiApi.uploadFiles(sessionId, files);
        setMessages((prev) => [
          ...prev,
          {
            type: "text",
            role: "system",
            content: `Uploaded ${files.length} file(s): ${[...files].map((f) => f.name).join(", ")}`,
            ts: nowTs(),
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
    [sessionId, aiApi],
  );

  const uploadToAvni = useCallback(async () => {
    if (!aiApi || !sessionId) return;
    try {
      await aiApi.uploadToAvni(sessionId);
    } catch (err) {
      // The backend publishes an `upload.done` SSE event for any relay
      // failure it reaches avni-server with (E_RELAY) — the failed-upload
      // card surfaces those inline. Session-level errors (E_NO_SESSION,
      // E_NO_BUNDLE, 401) skip that event and need the error banner.
      const detail = err.body ? safeParseDetail(err.body) : null;
      const code = detail?.code || "E_AVNI_UPLOAD";
      if (code === "E_RELAY") return;
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
  }, [sessionId, aiApi]);

  const resetSession = useCallback(async () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (aiApi && sessionId) {
      await aiApi.deleteSession(sessionId);
    }
    storeSessionId(null);
    setSessionId(null);
    setOrgName("");
    setMessages([]);
    setToolCalls([]);
    setError(null);
    setStatus("idle");
    setCheckingSetup(false);
    suppressNextAssistantRef.current = false;
  }, [sessionId, aiApi]);

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
    error,
    checkingSetup,
    start,
    send,
    resolveChanges,
    uploadFiles,
    uploadToAvni,
    downloadBundleUrl: aiApi && sessionId ? aiApi.bundleUrl(sessionId) : null,
    uploadErrorLogUrl: aiApi && sessionId ? aiApi.uploadErrorLogUrl(sessionId) : null,
    resetSession,
  };
};
