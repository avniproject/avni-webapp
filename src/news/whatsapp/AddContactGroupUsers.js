import React, { useState } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Dialog from "@material-ui/core/Dialog";
import { DialogActions, DialogTitle, LinearProgress } from "@material-ui/core";

import Box from "@material-ui/core/Box";
import { Close } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";

import ContactService from "../api/ContactService";
import ErrorMessage from "../../common/components/ErrorMessage";
import SearchUserAndConfirm from "./SearchUserAndConfirm";
import _ from "lodash";

const WorkflowStates = {
  Start: "Start",
  Adding: "Adding",
  AddError: "AddError"
};

const AddContactGroupUser = ({ contactGroupId, onClose, onUserAdd }) => {
  const onCloseHandler = () => onClose();
  const [workflowState, setWorkflowState] = useState(WorkflowStates.Start);
  const [error, setError] = useState(null);
  const displayError = _.includes([WorkflowStates.AddError], workflowState);
  const displayProgress = _.includes([WorkflowStates.Adding], workflowState);
  return (
    <Dialog
      onClose={onCloseHandler}
      aria-labelledby="customized-dialog-title"
      open={true}
      fullScreen
      style={{ backgroundColor: "black", color: "white" }}
    >
      <DialogTitle
        id="customized-dialog-title"
        onClose={onCloseHandler}
        style={{ backgroundColor: "black", color: "white" }}
      >
        Search users to add
      </DialogTitle>
      <DialogActions>
        <IconButton onClick={onCloseHandler}>
          <Close />
        </IconButton>
      </DialogActions>
      {displayProgress && <LinearProgress />}
      {displayError && <ErrorMessage error={error} />}
      <Box style={{ padding: 20 }}>
        <SearchUserAndConfirm
          // onUserAdd={x => onUserAdd(x)}
          onCancel={onCloseHandler}
          contactGroupId={contactGroupId}
          onUserSelected={selectedUser => {
            setWorkflowState(WorkflowStates.Adding);
            ContactService.addUserToContactGroup(contactGroupId, selectedUser)
              .then(() => onUserAdd(selectedUser))
              .catch(error => {
                setError(error);
                setWorkflowState(WorkflowStates.AddError);
              });
          }}
        />
      </Box>
    </Dialog>
  );
};

const mapStateToProps = state => ({});

export default withRouter(connect(mapStateToProps)(AddContactGroupUser));
