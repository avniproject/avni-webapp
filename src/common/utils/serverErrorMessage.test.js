import { assert } from "chai";
import { extractServerErrorMessage, messageFromServerErrorBody } from "./serverErrorMessage";

/**
 * Turning what avni-server returns into something an administrator can read.
 *
 * The server sends a full Java stack trace as the response body while
 * avni.exception.in.response is on, so every message that reaches a screen does so by having its first
 * line salvaged. These pin that salvage, and the precedence between the shapes it has to cope with.
 */
describe("serverErrorMessage", () => {
  const stackTraceBody =
    "org.avni.server.util.BadRequestError: A form named 'Household Registration' already exists.\n" +
    "\tat org.avni.server.web.FormController.assertNameIsFree(FormController.java:202)\n" +
    "\tat org.avni.server.web.FormController.createWeb(FormController.java:170)";

  describe("messageFromServerErrorBody", () => {
    it("takes the message off the front of a stack trace and drops the trace", () => {
      assert.equal("A form named 'Household Registration' already exists.", messageFromServerErrorBody(stackTraceBody, "fallback"));
    });

    it("copes with a server that strips the newline before the frames", () => {
      const runTogether =
        "org.avni.server.util.BadRequestError: Already exists.   at org.avni.server.web.FormController.x(FormController.java:1)";

      assert.equal("Already exists.", messageFromServerErrorBody(runTogether, "fallback"));
    });

    it("leaves a plain message alone", () => {
      assert.equal("Something went wrong", messageFromServerErrorBody("Something went wrong", "fallback"));
    });

    it("reads a structured body", () => {
      assert.equal("structured", messageFromServerErrorBody({ message: "structured" }, "fallback"));
      assert.equal("from error key", messageFromServerErrorBody({ error: "from error key" }, "fallback"));
    });

    it("falls back when there is no body at all", () => {
      assert.equal("fallback", messageFromServerErrorBody(undefined, "fallback"));
      assert.equal("fallback", messageFromServerErrorBody("   ", "fallback"));
    });
  });

  describe("extractServerErrorMessage", () => {
    it("reaches into the axios error for the body", () => {
      assert.equal(
        "A form named 'Household Registration' already exists.",
        extractServerErrorMessage({ response: { data: stackTraceBody } }, "fallback"),
      );
    });

    /**
     * The precedence the two share: the body's own message beats axios's, which beats the caller's
     * fallback. Delegating rearranged this, so it is worth holding down rather than assuming.
     */
    it("prefers the body over the axios message, and the axios message over the fallback", () => {
      assert.equal(
        "from the body",
        extractServerErrorMessage({ response: { data: { message: "from the body" } }, message: "from axios" }, "fallback"),
      );
      assert.equal("from axios", extractServerErrorMessage({ message: "from axios" }, "fallback"));
      assert.equal("fallback", extractServerErrorMessage({}, "fallback"));
    });

    it("survives a rejection that is not an axios error", () => {
      assert.equal("fallback", extractServerErrorMessage(undefined, "fallback"));
      assert.equal("fallback", extractServerErrorMessage(null, "fallback"));
    });
  });
});
