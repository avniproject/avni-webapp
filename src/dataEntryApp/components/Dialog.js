import { useState, Fragment } from "react";
import { styled } from "@mui/material/styles";
import { Dialog, DialogContent, DialogActions, IconButton, Box, Typography, Button } from "@mui/material";
import { Close, CheckCircleOutline } from "@mui/icons-material";
import { LineBreak } from "../../common/components/utils";

const StyledDialogTitle = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
  margin: "0 50",
  position: "relative"
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.grey[500]
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: "0px 20px"
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(1),
  justifyContent: "center"
}));

const StyledOkButton = styled(Button)(({ theme }) => ({
  backgroundColor: "orange",
  color: "white",
  height: 30,
  fontSize: 12,
  width: 100,
  cursor: "pointer",
  borderRadius: 50,
  padding: "4px 25px"
}));

const StyledCheckCircleOutline = styled(CheckCircleOutline)(({ theme }) => ({
  fontSize: "4rem",
  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
  fontWeight: 400,
  color: "gray"
}));

const CustomizedDialog = ({ title, showSuccessIcon, message, showOkbtn, openDialogContainer, onOk }) => {
  const [open, setOpen] = React.useState(openDialogContainer || false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOk = () => {
    setOpen(false);
    onOk(true);
  };

  return (
    <Fragment>
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        {title && (
          <StyledDialogTitle id="customized-dialog-title">
            <Typography variant="h6">{title}</Typography>
            <StyledCloseButton aria-label="close" onClick={handleClose} size="large">
              <Close />
            </StyledCloseButton>
          </StyledDialogTitle>
        )}
        <StyledDialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            {showSuccessIcon && <StyledCheckCircleOutline />}
            <LineBreak num={2} />
            {message && <Typography sx={{ mb: 10 }}>{message}</Typography>}
          </Box>
        </StyledDialogContent>
        <StyledDialogActions>
          {showOkbtn && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "flex-start",
                alignItems: "center"
              }}
            >
              <StyledOkButton onClick={handleOk} color="primary">
                Ok
              </StyledOkButton>
            </Box>
          )}
        </StyledDialogActions>
      </Dialog>
    </Fragment>
  );
};

export default CustomizedDialog;
