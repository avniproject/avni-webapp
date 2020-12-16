import { Button } from "@material-ui/core";
import React from "react";

const FormWizardButton = ({ text, className, to, params, onClick, disabled, id }) => {
  return (
    <Button disabled={disabled} className={className} onClick={onClick} type="button" id={id}>
      {text}
    </Button>
  );
};

export default FormWizardButton;
