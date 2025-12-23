import { get } from "lodash";

const errorMessageToTranslationKeyMap = {
  // Subject partition/access errors
  "not in your catchment": "notInThisUsersCatchment",
  "not in this user's catchment": "notInThisUsersCatchment",
  "sync attribute for user not valid for update": "syncAttributeForUserNotValidForUpdate",
  "user sync attribute not configured": "userSyncAttributeNotConfigured",
  "not directly assigned to this user": "notDirectlyAssignedToThisUser",

  // Entity not found errors (more specific patterns first)
  "program encounter not found": "programEncounterNotFound",
  "program enrolment not found": "programEnrolmentNotFound",
  "encounter not found": "encounterNotFound",
  "subject not found": "subjectNotFound",
  "individual not found": "subjectNotFound",

  // Privilege/access errors
  "does not have privilege": "insufficientPrivileges",
  "is not admin": "adminPrivilegeRequired",
  "operation disallowed": "operationNotAllowed",

  // Constraint/duplicate errors
  "already exists": "entityAlreadyExists",
  "already enrolled": "alreadyEnrolledInProgram",
  "constraint violation": "constraintViolationError",
  "data integrity violation": "dataIntegrityError",

  // Network/session errors
  "network error": "networkError",
  timeout: "requestTimeout",
  "session expired": "sessionExpired",
  unauthorized: "unauthorizedAccess",

  // File upload errors
  "maximum upload file size exceeded": "fileSizeExceeded",

  // Form/validation errors
  "no form mapping found": "formMappingNotFound",
  invalid: "invalidInput",
};

export const normalizeForMatching = (str) => {
  if (!str) return "";
  return (
    str
      .toLowerCase()
      //remove quotes, apostophe, doubleQuotes
      .replace(/['"`]/g, "")
      .replace(/[^a-z0-9]/g, " ") // Replace non-alphanumeric with space
      .replace(/\s+/g, " ") // Collapse multiple spaces to single space
      .trim()
  );
};

export const extractMessageFromJavaStackTrace = (stackTrace) => {
  if (!stackTrace || typeof stackTrace !== "string") return null;

  // Match patterns like "java.lang.RuntimeException: notInThisUsersCatchment at org..."
  // or "org.springframework.transaction.NoTransactionException: No transaction... at org..."
  const javaExceptionPattern = /([\w.]+(?:Exception|Error)):\s*(.+?)\s+at\s+[\w.]+/;
  const match = stackTrace.match(javaExceptionPattern);

  if (match && match[2]) {
    return match[2].trim();
  }

  return null;
};

export const mapToStandardErrorMessage = (serverMessage) => {
  if (!serverMessage) return null;

  const normalizedMessage = normalizeForMatching(serverMessage);

  for (const [pattern, translationKey] of Object.entries(errorMessageToTranslationKeyMap)) {
    const normalizedPattern = normalizeForMatching(pattern);
    if (normalizedMessage.includes(normalizedPattern)) {
      return translationKey;
    }
  }

  return serverMessage;
};

export const getAPIErrorMessage = (error) => {
  const defaultMessage = "somethingWentWrong";

  if (!error) return defaultMessage;

  let serverMessage = null;

  // Handle react-admin fetchUtils.fetchJson error format (error.body)
  if (error.body) {
    if (typeof error.body === "string") {
      serverMessage = error.body;
    } else {
      serverMessage = get(error.body, "message") || get(error.body, "errorMessage") || get(error.body, "error");
    }
  }

  // Handle axios error format (error.response.data)
  if (!serverMessage && error.response && error.response.data) {
    if (typeof error.response.data === "string") {
      serverMessage = error.response.data;
    } else {
      serverMessage = get(error.response.data, "message") || get(error.response.data, "errorMessage") || get(error.response.data, "error");
    }
  }

  // Handle plain error message
  if (!serverMessage && error.message) {
    serverMessage = error.message;
  }

  if (serverMessage) {
    const extractedMessage = extractMessageFromJavaStackTrace(serverMessage);
    if (extractedMessage) {
      return mapToStandardErrorMessage(extractedMessage);
    }
    // If we couldn't extract a message from stack trace and the serverMessage looks like a stack trace, return default
    if (serverMessage.includes(" at ") && serverMessage.includes("Exception")) {
      return defaultMessage;
    }
    return mapToStandardErrorMessage(serverMessage);
  }

  return defaultMessage;
};
