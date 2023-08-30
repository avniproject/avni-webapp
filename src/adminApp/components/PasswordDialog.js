import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import { isEqual, size } from "lodash";
import FormLabel from "@material-ui/core/FormLabel";
import MuiComponentHelper from "../../common/utils/MuiComponentHelper";

export default function PasswordDialog({ username, open, onClose, onConfirm, serverError }) {
  let initialPassword = { password: undefined, showPassword: false };
  const [password, setPassword] = React.useState(initialPassword);
  const [confirmPassword, setConfirmPassword] = React.useState(initialPassword);
  const [error, setError] = React.useState();

  React.useEffect(() => {
    setPassword(initialPassword);
    setConfirmPassword(initialPassword);
  }, [open]);

  const handleClickShowPassword = (state, handler) => {
    handler({ ...state, showPassword: !state.showPassword });
  };

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  const handleChange = (state, handler) => event => {
    setError();
    handler({ ...state, password: event.target.value });
  };

  const handleConfirm = () => {
    if (!isEqual(password.password, confirmPassword.password)) {
      setError("Password does not match.");
      return;
    } else if (size(password.password) < 8) {
      setError("Password too small, enter at least 8 characters.");
      return;
    }
    onConfirm(password.password);
  };

  React.useEffect(() => {
    setError(serverError);
  }, [serverError]);

  const passwordField = (state, handler, id, label) => {
    return (
      <FormControl>
        <InputLabel htmlFor={`${id}-${label}`}>{label}</InputLabel>
        <Input
          id={id}
          type={state.showPassword ? "text" : "password"}
          value={state.password}
          onChange={handleChange(state, handler)}
          autoComplete={"new-password"}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={() => handleClickShowPassword(state, handler)}
                onMouseDown={handleMouseDownPassword}
              >
                {state.showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    );
  };

  const title = `Reset password of ${username}.`;
  const content = `Enter the new password.`;
  return (
    <div>
      <Dialog
        open={open}
        onClose={MuiComponentHelper.getDialogClosingHandler(onClose)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="password-reset-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{content}</DialogContentText>
          {passwordField(password, setPassword, "password", "New password")}
          <p />
          {passwordField(confirmPassword, setConfirmPassword, "Verify-password", "Verify password")}
          <p />
          <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
            {error}
          </FormLabel>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
