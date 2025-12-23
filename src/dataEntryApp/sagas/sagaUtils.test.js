import { getAPIErrorMessage, mapToStandardErrorMessage, normalizeForMatching } from "./sagaUtils";

describe("sagaUtils", () => {
  describe("normalizeForMatching", () => {
    it("should return empty string for null input", () => {
      expect(normalizeForMatching(null)).toBe("");
    });

    it("should return empty string for undefined input", () => {
      expect(normalizeForMatching(undefined)).toBe("");
    });

    it("should convert to lowercase", () => {
      expect(normalizeForMatching("HELLO WORLD")).toBe("hello world");
    });

    it("should replace non-alphanumeric characters with spaces", () => {
      expect(normalizeForMatching("user's catchment")).toBe("users catchment");
    });

    it("should collapse multiple spaces to single space", () => {
      expect(normalizeForMatching("hello    world")).toBe("hello world");
    });

    it("should handle underscores and hyphens", () => {
      expect(normalizeForMatching("subject_not-found")).toBe("subject not found");
    });

    it("should trim leading and trailing spaces", () => {
      expect(normalizeForMatching("  hello world  ")).toBe("hello world");
    });
  });

  describe("mapToStandardErrorMessage", () => {
    it("should return null for null input", () => {
      expect(mapToStandardErrorMessage(null)).toBeNull();
    });

    it("should return null for undefined input", () => {
      expect(mapToStandardErrorMessage(undefined)).toBeNull();
    });

    describe("exact matches", () => {
      it("should map 'not in your catchment' to notInThisUsersCatchment", () => {
        expect(mapToStandardErrorMessage("not in your catchment")).toBe("notInThisUsersCatchment");
      });

      it("should map 'subject not found' to subjectNotFound", () => {
        expect(mapToStandardErrorMessage("subject not found")).toBe("subjectNotFound");
      });

      it("should map 'already exists' to entityAlreadyExists", () => {
        expect(mapToStandardErrorMessage("already exists")).toBe("entityAlreadyExists");
      });
    });

    describe("case insensitive matching", () => {
      it("should match uppercase 'NOT IN YOUR CATCHMENT'", () => {
        expect(mapToStandardErrorMessage("NOT IN YOUR CATCHMENT")).toBe("notInThisUsersCatchment");
      });

      it("should match mixed case 'Subject Not Found'", () => {
        expect(mapToStandardErrorMessage("Subject Not Found")).toBe("subjectNotFound");
      });

      it("should match 'ALREADY EXISTS'", () => {
        expect(mapToStandardErrorMessage("ALREADY EXISTS")).toBe("entityAlreadyExists");
      });
    });

    describe("fuzzy matching with punctuation variations", () => {
      it("should match 'not in this user's catchment' with apostrophe", () => {
        expect(mapToStandardErrorMessage("not in this user's catchment")).toBe("notInThisUsersCatchment");
      });

      it("should match 'subject-not-found' with hyphens", () => {
        expect(mapToStandardErrorMessage("subject-not-found")).toBe("subjectNotFound");
      });

      it("should match 'SUBJECT_NOT_FOUND' with underscores", () => {
        expect(mapToStandardErrorMessage("SUBJECT_NOT_FOUND")).toBe("subjectNotFound");
      });
    });

    describe("fuzzy matching with spacing variations", () => {
      it("should match 'subject   not   found' with extra spaces", () => {
        expect(mapToStandardErrorMessage("subject   not   found")).toBe("subjectNotFound");
      });

      it("should match '  subject not found  ' with leading/trailing spaces", () => {
        expect(mapToStandardErrorMessage("  subject not found  ")).toBe("subjectNotFound");
      });
    });

    describe("partial matches in longer messages", () => {
      it("should match when pattern is part of longer message", () => {
        expect(mapToStandardErrorMessage("Error: Subject not found in database")).toBe("subjectNotFound");
      });

      it("should match catchment error in longer message", () => {
        expect(mapToStandardErrorMessage("The individual is not in your catchment area")).toBe("notInThisUsersCatchment");
      });

      it("should match privilege error in longer message", () => {
        expect(mapToStandardErrorMessage("User does not have privilege to perform this action")).toBe("insufficientPrivileges");
      });
    });

    describe("unmatched messages", () => {
      it("should return original message if no pattern matches", () => {
        expect(mapToStandardErrorMessage("Some unknown error")).toBe("Some unknown error");
      });

      it("should return original message for random text", () => {
        expect(mapToStandardErrorMessage("xyz123")).toBe("xyz123");
      });
    });

    describe("actual server camelCase error keys (from SubjectPartitionCheckStatus)", () => {
      it("should return notInThisUsersCatchment as-is (server sends camelCase key)", () => {
        expect(mapToStandardErrorMessage("notInThisUsersCatchment")).toBe("notInThisUsersCatchment");
      });

      it("should return notDirectlyAssignedToThisUser as-is", () => {
        expect(mapToStandardErrorMessage("notDirectlyAssignedToThisUser")).toBe("notDirectlyAssignedToThisUser");
      });

      it("should return userSyncAttributeNotConfigured as-is", () => {
        expect(mapToStandardErrorMessage("userSyncAttributeNotConfigured")).toBe("userSyncAttributeNotConfigured");
      });

      it("should return syncAttributeForUserNotValidForUpdate as-is", () => {
        expect(mapToStandardErrorMessage("syncAttributeForUserNotValidForUpdate")).toBe("syncAttributeForUserNotValidForUpdate");
      });
    });

    describe("all error categories", () => {
      it("should map sync attribute errors", () => {
        expect(mapToStandardErrorMessage("sync attribute for user not valid for update")).toBe("syncAttributeForUserNotValidForUpdate");
      });

      it("should map user sync attribute not configured", () => {
        expect(mapToStandardErrorMessage("user sync attribute not configured")).toBe("userSyncAttributeNotConfigured");
      });

      it("should map not directly assigned errors", () => {
        expect(mapToStandardErrorMessage("not directly assigned to this user")).toBe("notDirectlyAssignedToThisUser");
      });

      it("should map encounter not found", () => {
        expect(mapToStandardErrorMessage("encounter not found")).toBe("encounterNotFound");
      });

      it("should map program encounter not found", () => {
        expect(mapToStandardErrorMessage("program encounter not found")).toBe("programEncounterNotFound");
      });

      it("should map program enrolment not found", () => {
        expect(mapToStandardErrorMessage("program enrolment not found")).toBe("programEnrolmentNotFound");
      });

      it("should map admin privilege required", () => {
        expect(mapToStandardErrorMessage("User is not admin")).toBe("adminPrivilegeRequired");
      });

      it("should map operation disallowed", () => {
        expect(mapToStandardErrorMessage("This operation disallowed for users")).toBe("operationNotAllowed");
      });

      it("should map already enrolled", () => {
        expect(mapToStandardErrorMessage("Subject already enrolled in program")).toBe("alreadyEnrolledInProgram");
      });

      it("should map constraint violation", () => {
        expect(mapToStandardErrorMessage("Database constraint violation occurred")).toBe("constraintViolationError");
      });

      it("should map data integrity violation", () => {
        expect(mapToStandardErrorMessage("Data integrity violation error")).toBe("dataIntegrityError");
      });

      it("should map network error", () => {
        expect(mapToStandardErrorMessage("Network error occurred")).toBe("networkError");
      });

      it("should map timeout", () => {
        expect(mapToStandardErrorMessage("Request timeout")).toBe("requestTimeout");
      });

      it("should map session expired", () => {
        expect(mapToStandardErrorMessage("Your session expired")).toBe("sessionExpired");
      });

      it("should map unauthorized", () => {
        expect(mapToStandardErrorMessage("Unauthorized access attempt")).toBe("unauthorizedAccess");
      });

      it("should map file size exceeded", () => {
        expect(mapToStandardErrorMessage("Maximum upload file size exceeded")).toBe("fileSizeExceeded");
      });

      it("should map form mapping not found", () => {
        expect(mapToStandardErrorMessage("No form mapping found for this type")).toBe("formMappingNotFound");
      });
    });
  });

  describe("getAPIErrorMessage", () => {
    it("should return somethingWentWrong for null error", () => {
      expect(getAPIErrorMessage(null)).toBe("somethingWentWrong");
    });

    it("should extract message from error.response.data.message", () => {
      const error = {
        response: {
          data: {
            message: "Subject not found",
          },
        },
      };
      expect(getAPIErrorMessage(error)).toBe("subjectNotFound");
    });

    it("should extract message from error.response.data.errorMessage", () => {
      const error = {
        response: {
          data: {
            errorMessage: "Not in your catchment",
          },
        },
      };
      expect(getAPIErrorMessage(error)).toBe("notInThisUsersCatchment");
    });

    it("should extract message from error.response.data.error", () => {
      const error = {
        response: {
          data: {
            error: "Already exists",
          },
        },
      };
      expect(getAPIErrorMessage(error)).toBe("entityAlreadyExists");
    });

    it("should return somethingWentWrong when response.data has no message fields", () => {
      const error = {
        response: {
          data: {},
        },
      };
      expect(getAPIErrorMessage(error)).toBe("somethingWentWrong");
    });

    it("should fall back to error.message when no response", () => {
      const error = {
        message: "Network error",
      };
      expect(getAPIErrorMessage(error)).toBe("networkError");
    });

    it("should return somethingWentWrong when error has no message", () => {
      const error = {};
      expect(getAPIErrorMessage(error)).toBe("somethingWentWrong");
    });
  });
});
