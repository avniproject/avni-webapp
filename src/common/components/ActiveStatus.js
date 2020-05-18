import React from "react";
import FormLabel from "@material-ui/core/FormLabel";

export const ActiveStatusInShow = ({ status }) => {
  return (
    <>
      <div>
        <FormLabel style={{ fontSize: "13px" }}>Active</FormLabel>
        <br />
        {status ? "Yes" : "No"}
      </div>
      <p />
    </>
  );
};
