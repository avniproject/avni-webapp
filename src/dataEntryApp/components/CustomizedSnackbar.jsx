import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import { CheckCircle, Error } from "@mui/icons-material";
import { red, green } from "@mui/material/colors";
import { Snackbar, SnackbarContent } from "@mui/material";
import _ from "lodash";

const variantIcon = {
  success: CheckCircle,
  error: Error,
};

const StyledSnackbarContent = styled(SnackbarContent, {
  shouldForwardProp: (prop) => !["variant"].includes(prop),
})(({ variant }) => ({
  ...(variant === "success" && {
    backgroundColor: green[600],
    minWidth: 220,
  }),
  ...(variant === "error" && {
    backgroundColor: red[300],
    minWidth: 220,
  }),
}));

const StyledMessage = styled("span")({
  display: "flex",
  alignItems: "center",
});

const StyledIcon = styled("span")(({ theme }) => ({
  fontSize: 20,
  opacity: 0.9,
  marginRight: theme.spacing(1),
}));

function MySnackbarContentWrapper({ message, variant, ...other }) {
  const Icon = variantIcon[variant];

  return (
    <StyledSnackbarContent
      aria-describedby="client-snackbar"
      variant={variant}
      message={
        <StyledMessage>
          <StyledIcon as={Icon} />
          {message}
        </StyledMessage>
      }
      {...other}
    />
  );
}

MySnackbarContentWrapper.propTypes = {
  message: PropTypes.string,
  variant: PropTypes.oneOf(["success", "error"]).isRequired,
};

export default function CustomizedSnackbar({
  defaultSnackbarStatus = true,
  message,
  onClose = _.noop,
}) {
  const isError =
    message === "Profile image URL is not correct or couldn't be loaded.";
  const variant = isError ? "error" : "success";
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      open={defaultSnackbarStatus}
      autoHideDuration={2000}
      onClose={() => onClose()}
      slotProps={{
        transition: {
          timeout: 300,
          appear: false,
          mountOnEnter: true,
          unmountOnExit: true,
        },
      }}
    >
      <MySnackbarContentWrapper variant={variant} message={message} />
    </Snackbar>
  );
}
