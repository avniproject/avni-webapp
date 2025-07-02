import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

export const ActionButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText("#008b8a"),
  backgroundColor: "#008b8a",
  "&:hover": {
    backgroundColor: "#008b8a"
  }
}));