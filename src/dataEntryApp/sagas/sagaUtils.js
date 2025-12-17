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

  if (error.response && error.response.data) {
    const serverMessage =
      get(error.response.data, "message") || get(error.response.data, "errorMessage") || get(error.response.data, "error");

    if (serverMessage) {
      return mapToStandardErrorMessage(serverMessage);
    }
    return defaultMessage;
  }

  return error.message ? mapToStandardErrorMessage(error.message) : defaultMessage;
};
