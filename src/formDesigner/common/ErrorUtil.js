import { find, isEmpty } from "lodash";
import FormLabel from "@material-ui/core/FormLabel";
import React from "react";

export const getErrorByKey = (errors, errorKey) => {
  const errorByKey = find(errors, ({ key }) => key === errorKey);
  return isEmpty(errorByKey) ? null : (
    <FormLabel error style={{ fontSize: "14px" }}>
      {errorByKey.message}
    </FormLabel>
  );
};
