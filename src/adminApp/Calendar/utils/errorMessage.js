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
const EXCEPTION_FQCN_PREFIX = /^[\w.$]+(Exception|Error):\s*/;
const STACK_FRAME_BOUNDARY = /\n|\s+at\s+[\w.$]+/;

export function extractServerErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) {
    const cutAt = data.search(STACK_FRAME_BOUNDARY);
    const messageLine = (cutAt === -1 ? data : data.slice(0, cutAt)).trim();
    return messageLine.replace(EXCEPTION_FQCN_PREFIX, "").trim();
  }
  return data?.message || data?.error || err?.message || fallback;
}
