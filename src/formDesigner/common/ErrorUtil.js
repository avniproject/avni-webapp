import { find, get, isEmpty, isNil } from "lodash";
import FormLabel from "@material-ui/core/FormLabel";
import React from "react";

export const getErrorByKey = (errors, errorKey) => {
  const errorByKey = find(errors, ({ key }) => key === errorKey);
  return isEmpty(errorByKey) ? null : (
    <FormLabel error style={{ fontSize: "12px" }}>
      {errorByKey.message}
    </FormLabel>
  );
};

const ServerErrorKey = "SERVER_ERROR";

export const createServerError = function(serverError, defaultMessage) {
  const formError = {};
  formError.key = ServerErrorKey;
  formError.message = `${get(serverError, "response.data") || get(serverError, "message") || defaultMessage}`;
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
