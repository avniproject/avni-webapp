import { styled } from "@mui/material/styles";
import { Typography, DialogTitle, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(2)
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.grey[500]
}));

export const CustomDialogTitle = ({ children, onClose, ...other }) => {
  return (
    <StyledDialogTitle
      {...other}
      sx={{
        m: 0,
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <Typography variant="h6" component="span">
        {children}
      </Typography>
      <StyledCloseButton aria-label="close" onClick={onClose} size="large">
        <Close />
      </StyledCloseButton>
    </StyledDialogTitle>
  );
};
