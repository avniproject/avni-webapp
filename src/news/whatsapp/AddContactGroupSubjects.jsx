import { useState } from "react";
import { Dialog, DialogActions, DialogTitle, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import ChooseSubject from "./ChooseSubject";
import ContactService from "../api/ContactService";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";

const AddContactGroupSubject = ({ contactGroupId, onClose, onSubjectAdd }) => {
  const onCloseHandler = () => onClose();
  const [error, setError] = useState(null);
  const [isBusy, setBusy] = useState(false);
  const [userError, setUserError] = useState(null);

  return (
    <Dialog
      onClose={onCloseHandler}
      aria-labelledby="customized-dialog-title"
      open={true}
      fullScreen
    >
      <DialogTitle
        id="customized-dialog-title"
        onClose={onCloseHandler}
        style={{ backgroundColor: "black", color: "white" }}
      >
        Search subject to add
      </DialogTitle>
      <DialogActions>
        <IconButton onClick={onCloseHandler} size="large">
          <Close />
        </IconButton>
      </DialogActions>
      {(!!userError || !!error) && (
        <CustomizedSnackbar
          variant={"error"}
          message={
            userError
              ? userError
              : error.response.data
              ? error.response.data
              : "Unexpected error occurred"
          }
          getDefaultSnackbarStatus={snackbarStatus => {
            setError(snackbarStatus);
            setUserError(snackbarStatus);
          }}
          defaultSnackbarStatus={error || userError}
        />
      )}
      <ChooseSubject
        onCancel={() => onCloseHandler()}
        confirmActionLabel="Add"
        busy={isBusy}
        onSubjectChosen={subject => {
          ContactService.addSubjectToContactGroup(contactGroupId, subject)
            .then(x => {
              if (x.status === 204) {
                setUserError(
                  "Subject doesn't have phone number or has incorrect phone number."
                );
                setBusy(false);
                return;
              }
              onSubjectAdd(x);
            })
            .catch(error => {
              setError(error);
              setBusy(false);
            });
          setBusy(true);
        }}
      />
    </Dialog>
  );
};

export default AddContactGroupSubject;
