import { styled } from "@mui/material/styles";
import { forwardRef } from "react";
import PropTypes from "prop-types";
import { CheckCircle, Error, Close, Warning } from "@mui/icons-material";
import { IconButton, Snackbar, SnackbarContent } from "@mui/material";
import { green } from "@mui/material/colors";

const variantIcon = {
  success: CheckCircle,
  error: Error,
  warning: Warning
};

const textColors = {
  success: "#fff",
  warning: "#000",
  error: "#fff"
};

const StyledSnackbarContent = styled(SnackbarContent, {
  shouldForwardProp: prop => !["variant"].includes(prop)
})(({ variant }) => ({
  ...(variant === "success" && {
    backgroundColor: green[600]
  }),
  ...(variant === "error" && {
    backgroundColor: "#d0011b"
  }),
  ...(variant === "warning" && {
    backgroundColor: "#ffc107"
  })
}));

const StyledMessage = styled("span")({
  display: "flex",
  alignItems: "center"
});

const StyledMessageText = styled("h5")(({ variant }) => ({
  color: textColors[variant]
}));

const StyledIcon = styled("span")(({ theme }) => ({
  fontSize: 20,
  opacity: 0.9,
  marginRight: theme.spacing(1)
}));

const StyledCloseIcon = styled(Close)({
  fontSize: 20
});

const MySnackbarContentWrapper = forwardRef(
  ({ message, onClose, variant = "success", ...other }, ref) => {
    const Icon = variantIcon[variant];

    return (
      <StyledSnackbarContent
        ref={ref}
        aria-describedby="client-snackbar"
        variant={variant}
        message={
          <StyledMessage>
            <StyledIcon as={Icon} />
            <StyledMessageText variant={variant}>{message}</StyledMessageText>
          </StyledMessage>
        }
        action={[
          <IconButton
            key="close"
            aria-label="close"
            color="inherit"
            onClick={onClose}
            size="large"
          >
            <StyledCloseIcon />
          </IconButton>
        ]}
        {...other}
      />
    );
  }
);

MySnackbarContentWrapper.propTypes = {
  message: PropTypes.string,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(["success", "error", "warning"]).isRequired
};

export default function CustomizedSnackbar({
  getDefaultSnackbarStatus,
  defaultSnackbarStatus = true,
  onExited,
  variant = "success",
  message,
  autoHideDuration = 2000
}) {
  function handleClose(event, reason) {
    if (reason === "clickaway") {
      getDefaultSnackbarStatus(false);
      return;
    }
    getDefaultSnackbarStatus(false);
  }

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center"
      }}
      open={defaultSnackbarStatus}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      slotProps={{ transition: { onExited: onExited } }}
    >
      <MySnackbarContentWrapper
        onClose={handleClose}
        variant={variant}
        message={message}
      />
    </Snackbar>
  );
}
