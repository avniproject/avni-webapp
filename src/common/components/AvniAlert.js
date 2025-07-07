import { styled } from "@mui/material/styles";
import { Paper } from "@mui/material";

import { clsx } from "clsx";
import { Info, Warning } from "@mui/icons-material";

const StyledPaper = styled(Paper)(({ theme, variant, severity }) => ({
  padding: theme.spacing(1),
  ...(variant === "outlined" &&
    severity === "warning" && {
      color: "rgb(102,60,0)",
      border: "1px solid #ff9800"
    }),
  ...(variant === "outlined" &&
    severity === "info" && {
      color: "rgb(13,60,97)",
      border: "1px solid #2196f3"
    })
}));

const IconWrapper = styled("div")(({ severity }) => ({
  display: "flex",
  alignItems: "center",
  ...(severity === "warning" && {
    color: "#ff9800"
  }),
  ...(severity === "info" && {
    color: "#2196f3"
  })
}));

export const AvniAlert = ({ severity, variant, ...props }) => {
  return (
    <StyledPaper square elevation={0} variant={variant} severity={severity} className={clsx("root")}>
      <IconWrapper severity={severity}>
        {severity === "warning" ? <Warning /> : <Info />}
        {props.children}
      </IconWrapper>
    </StyledPaper>
  );
};
