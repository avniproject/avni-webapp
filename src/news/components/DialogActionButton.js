import Button from "@material-ui/core/Button";
import React from "react";

export const DialogActionButton = ({ onClick, color, text, textColor, ...props }) => {
  return (
    <Button onClick={onClick} style={{ backgroundColor: color, color: textColor }} {...props}>
      {text}
    </Button>
  );
};
