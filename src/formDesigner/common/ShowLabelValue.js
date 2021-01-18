import FormLabel from "@material-ui/core/FormLabel";
import React from "react";

export const ShowLabelValue = ({ label, value }) => {
  return (
    <div>
      <FormLabel style={{ fontSize: "13px" }}>{label}</FormLabel>
      <br />
      <span style={{ fontSize: "15px" }}>{value}</span>
    </div>
  );
};
