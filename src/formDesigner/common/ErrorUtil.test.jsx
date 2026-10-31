/**
 * avni-webapp#1494: editing + saving a subject type/program showed an unreadable error. The
 * server (Spring Boot 3, Jakarta namespace) returns errors like
 * "jakarta.validation.ConstraintViolationException: <message>", but getDBValidationError stripped
 * only a "javax.*:" prefix, so the raw jakarta exception class leaked into the message. The fix
 * strips both javax.* and jakarta.* prefixes.
 */
import { getDBValidationError } from "./ErrorUtil";

describe("getDBValidationError (#1494)", () => {
  it("strips a Jakarta (Spring 6) exception class prefix, leaving the message", () => {
    const error = {
      response: {
        data: "jakarta.validation.ConstraintViolationException: Name is required",
      },
    };
    const msg = getDBValidationError(error, "");
    expect(msg).not.toMatch(/jakarta\./);
    expect(msg).toContain("Name is required");
  });

  it("still strips a legacy javax.* prefix", () => {
    const error = {
      response: {
        data: "javax.persistence.PersistenceException: duplicate key",
      },
    };
    const msg = getDBValidationError(error, "");
    expect(msg).not.toMatch(/javax\./);
    expect(msg).toContain("duplicate key");
  });
});
