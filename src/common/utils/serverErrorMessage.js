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
  return messageFromServerErrorBody(err?.response?.data, err?.message || fallback);
}
