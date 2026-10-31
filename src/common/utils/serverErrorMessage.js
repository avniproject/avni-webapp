// avni-server's ErrorInterceptors emits some errors as a plain-string response
// body containing a Java stack trace, e.g.
//   "org.avni.server.util.BadRequestError: <message>\n\tat <stack>..."
// Pull just the human-readable message off the front so it can be shown to the
// user. Defensive against:
//  - arbitrary exception FQCNs (BadRequestError today, ResourceNotFoundException
//    or DataIntegrityViolationException tomorrow)
//  - servers/proxies that strip the newline between message and stack frames
// Other response shapes (structured { message } / { error } from other handlers,
// or axios's own err.message) are handled too.
//
// Lives here rather than under adminApp/Calendar, where it started: nothing about it is
// calendar-specific and it is used from the form designer as well. Named for the server rather than
// matching ErrorMessageUtil beside it, which is a different job - that one shapes unhandled window
// and promise rejections and never reads a response body.
import { isNetworkError, NETWORK_ERROR_MESSAGE } from "./networkError";

const EXCEPTION_FQCN_PREFIX = /^[\w.$]+(Exception|Error):\s*/;
const STACK_FRAME_BOUNDARY = /\n|\s+at\s+[\w.$]+/;

/**
 * For callers holding the response body itself rather than the error.
 *
 * FormSettings keeps the untouched body so Copy to clipboard can offer it, and renders this. Passing
 * that string to extractServerErrorMessage instead would look right and silently return the fallback
 * every time, because that one reaches into err.response.data.
 */
export function messageFromServerErrorBody(data, fallback) {
  if (typeof data === "string" && data.trim()) {
    const cutAt = data.search(STACK_FRAME_BOUNDARY);
    const messageLine = (cutAt === -1 ? data : data.slice(0, cutAt)).trim();
    return messageLine.replace(EXCEPTION_FQCN_PREFIX, "").trim();
  }
  return data?.message || data?.error || fallback;
}

/** For callers holding the rejected axios error, which is most of them. */
export function extractServerErrorMessage(err, fallback) {
  if (isNetworkError(err)) return NETWORK_ERROR_MESSAGE;
  return messageFromServerErrorBody(err?.response?.data, err?.message || fallback);
}

function readBlobAsText(blob) {
  if (typeof blob.text === "function") return blob.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

const GATEWAY_STATUSES = [502, 503, 504];

/**
 * A 502-504 comes from the proxy in front of the server, with an HTML page as its body, when a
 * request outlasts the proxy's limit. The work usually carries on in the server. Returns a plain
 * sentence saying so, or null when the error is something else.
 */
export function gatewayTimeoutMessage(err) {
  const status = err?.response?.status;
  if (!GATEWAY_STATUSES.includes(status)) return null;
  return `The server took too long to respond (HTTP ${status}). The request may still be running; check again in a few minutes before trying once more.`;
}

/**
 * For callers that asked axios for responseType "blob" (file downloads). Axios then hands the error
 * body back as a Blob too, so reading it as a string gives "[object Blob]" - which is what the bundle
 * download alert used to show. Reads the Blob as text, then treats it like any other body. A 502-504
 * comes from the proxy rather than the server, with an HTML page as the body, so it gets a plain
 * sentence instead of markup.
 */
export async function extractServerErrorMessageFromBlob(err, fallback) {
  if (isNetworkError(err)) return NETWORK_ERROR_MESSAGE;
  const gateway = gatewayTimeoutMessage(err);
  if (gateway) return gateway;
  const data = err?.response?.data;
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    let text = "";
    try {
      text = await readBlobAsText(data);
    } catch (e) {
      return err?.message || fallback;
    }
    let body = text;
    try {
      body = JSON.parse(text);
    } catch (e) {
      // not JSON: the text itself is the message
    }
    return messageFromServerErrorBody(body, err?.message || fallback);
  }
  return extractServerErrorMessage(err, fallback);
}
