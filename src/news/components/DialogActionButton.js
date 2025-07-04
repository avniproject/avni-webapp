import { Button } from "@mui/material";

export const DialogActionButton = ({ onClick, color, text, textColor, ...props }) => {
  return (
    <Button onClick={onClick} style={{ backgroundColor: color, color: textColor }} {...props}>
      {text}
    </Button>
  );
};
