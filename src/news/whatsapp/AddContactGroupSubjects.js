import React, { useState } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Dialog from "@material-ui/core/Dialog";
import { DialogActions, DialogTitle } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import ChooseSubject from "./ChooseSubject";
import ContactService from "../api/ContactService";
import ErrorMessage from "../../common/components/ErrorMessage";
import UserError from "../../common/components/UserError";

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
        <IconButton onClick={onCloseHandler}>
          <Close />
        </IconButton>
      </DialogActions>
      <ErrorMessage error={error} />
      <UserError error={userError} />
      <ChooseSubject
        onCancel={() => onCloseHandler()}
        confirmActionLabel="Add"
        busy={isBusy}
        onSubjectChosen={subject => {
          ContactService.addSubjectToContactGroup(contactGroupId, subject)
            .then(x => {
              if (x.status === 204) {
                setUserError("Subject doesn't have phone number or has incorrect phone number.");
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

export default withRouter(connect()(AddContactGroupSubject));
