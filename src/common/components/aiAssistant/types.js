/**
 * SSE event payload typedefs — mirror the backend (specs/AVNI_WEBAPP_INTEGRATION_SDD §4.2)
 * and the helpers in `avni-ai/src/web/events.py`.
 *
 * Used as documentation only; the wire format is plain JSON.
 *
 * @typedef {Object} AgentMessageEvent
 * @property {"assistant"} role
 * @property {string} content
 * @property {string} ts
 *
 * @typedef {Object} ToolCallEvent
 * @property {string} tool
 * @property {Object} args
 * @property {string} call_id
 *
 * @typedef {Object} ToolResultEvent
 * @property {string} call_id
 * @property {boolean} ok
 * @property {string} summary
 *
 * @typedef {Object} HitlChange
 * @property {string} change_id
 * @property {string} form
 * @property {string} field
 * @property {string} kind
 * @property {Object} before
 * @property {Object} after
 * @property {string} reason
 *
 * @typedef {Object} HitlPendingEvent
 * @property {string} interrupt_id
 * @property {HitlChange[]} changes
 *
 * @typedef {Object} BundleReadyEvent
 * @property {string} path
 * @property {Object} summary
 *
 * @typedef {Object} UploadDoneEvent
 * @property {string} job_id
 * @property {"ok"|"failed"} status
 * @property {string} [details]
 *
 * @typedef {Object} ErrorEvent
 * @property {string} code
 * @property {string} message
 * @property {boolean} recoverable
 *
 * @typedef {Object} SessionClosedEvent
 * @property {string} reason
 */

export const EVENT_TYPES = {
  AGENT_MESSAGE: "agent.message",
  TOOL_CALL: "tool.call",
  TOOL_RESULT: "tool.result",
  HITL_PENDING: "hitl.pending",
  BUNDLE_READY: "bundle.ready",
  UPLOAD_DONE: "upload.done",
  ERROR: "error",
  SESSION_CLOSED: "session.closed",
};

/** Decisions a user can make on a single pending change. */
export const DECISIONS = { YES: "yes", NO: "no", EDIT: "edit" };
