import { find, get, isEmpty, isNil, join, replace, split } from "lodash";
import { FormLabel } from "@mui/material";

export const getErrorByKey = (errors, errorKey) => {
  const errorByKey = find(errors, ({ key }) => key === errorKey);
  return isEmpty(errorByKey) ? null : (
    <FormLabel error style={{ fontSize: "14px" }}>
      {errorByKey.message}
    </FormLabel>
  );
};

const ServerErrorKey = "SERVER_ERROR";

const SERVER_ERROR_STACKTRACE_STARTING_PATTERN = /^org\..*: /;
const DB_ERROR_STACKTRACE_STARTING_PATTERN = /^javax\..*: /;
const EMPTY_STRING = "";
const NEW_LINE_SEPARATOR = /\n|\r/;
export const createServerError = function(serverError, defaultMessage) {
  const formError = {};
  formError.key = ServerErrorKey;
  let errorMessage = `${get(serverError, "response.data") ||
    get(serverError, "message") ||
    defaultMessage}`;
  formError.message = split(
    replace(
      errorMessage,
      SERVER_ERROR_STACKTRACE_STARTING_PATTERN,
      EMPTY_STRING
    ),
    NEW_LINE_SEPARATOR,
    1
  );
  return formError;
};

export const getServerError = function(errors) {
  return find(errors, ({ key }) => key === ServerErrorKey);
};

export const hasServerError = function(errors) {
  return !isNil(getServerError(errors));
};

export const removeServerError = function(errors) {
  return errors.filter(({ key }) => key !== ServerErrorKey);
};

export const getDBValidationError = function(serverError, defaultMessage) {
  const formError = {};
  formError.key = ServerErrorKey;
  let errorMessage = `${get(serverError, "response.data") ||
    get(serverError, "message") ||
    defaultMessage}`;
  return join(
    split(
      replace(errorMessage, DB_ERROR_STACKTRACE_STARTING_PATTERN, EMPTY_STRING),
      NEW_LINE_SEPARATOR,
      3
    )
  );
};
