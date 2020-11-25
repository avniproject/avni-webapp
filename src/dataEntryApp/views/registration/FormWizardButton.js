import { Button } from "@material-ui/core";
import { InternalLink } from "common/components/utils";
import React from "react";

const FormWizardButton = ({ text, className, to, params, onClick, disabled }) => {
  if (disabled) {
    return (
      <Button disabled={disabled} className={className} onClick={onClick} type="button">
        {text}
      </Button>
    );
  }
  if (to) {
    return (
      <InternalLink noUnderline to={to} params={{ page: "" }}>
        <Button className={className} onClick={onClick} type="button">
          {text}
        </Button>
      </InternalLink>
    );
  }
  return (
    <Button className={className} onClick={onClick} type="button">
      {text}
    </Button>
  );
};

export default FormWizardButton;
