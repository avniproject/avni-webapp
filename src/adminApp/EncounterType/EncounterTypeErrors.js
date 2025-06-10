import { FormLabel } from "@mui/material";
import React from "react";

const EncounterTypeErrors = ({ nameValidation, subjectValidation, error }) => {
  return (
    <div>
      <div>
        {nameValidation && (
          <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
            Empty name is not allowed.
          </FormLabel>
        )}
      </div>
      <div>
        {subjectValidation && (
          <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
            Empty subject type is not allowed.
          </FormLabel>
        )}
      </div>
      <div>
        {error !== "" && (
          <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
            {error}
          </FormLabel>
        )}
      </div>
    </div>
  );
};
export default EncounterTypeErrors;
