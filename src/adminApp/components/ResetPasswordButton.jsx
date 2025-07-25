import { useState, Fragment } from "react";
import { Button } from "@mui/material";
import { useRecordContext, useNotify } from "react-admin";
import PasswordDialog from "./PasswordDialog";
import { httpClient } from "../../common/utils/httpClient";
import { get } from "lodash";

const ResetPasswordButton = () => {
  const [isOpen, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const record = useRecordContext();
  const notify = useNotify();

  const handleClick = () => setOpen(true);
  const handleDialogClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleConfirm = async password => {
    try {
      await httpClient.putJson("/user/resetPassword", {
        userId: record.id,
        password: password
      });
      notify("Password reset successfully", { type: "info" });
      setOpen(false);
    } catch (e) {
      setError(
        get(e, "response.data.message", "Unknown error. Could not set password")
      );
    }
  };

  if (!record) return null;

  return (
    <Fragment>
      <Button onClick={handleClick} style={{ color: "#3f51b5" }}>
        Reset password
      </Button>
      <PasswordDialog
        open={isOpen}
        username={record.username}
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
        serverError={error}
      />
    </Fragment>
  );
};

export default ResetPasswordButton;
