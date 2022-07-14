import React from "react";
import FormLabel from "@material-ui/core/FormLabel";

export const TextFieldInShow = ({ text, label }) => {
  return (
    <>
      <div>
        <FormLabel style={{ fontSize: "13px" }}>{label}</FormLabel>
        <br />
        <span style={{ fontSize: "15px" }}>{text}</span>
      </div>
      <p />
    </>
  );
};
