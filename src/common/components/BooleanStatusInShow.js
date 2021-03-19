import React from "react";
import FormLabel from "@material-ui/core/FormLabel";

export const BooleanStatusInShow = ({ status, label }) => {
  return (
    <>
      <div>
        <FormLabel style={{ fontSize: "13px" }}>{label}</FormLabel>
        <br />
        {status ? "Yes" : "No"}
      </div>
      <p />
    </>
  );
};
