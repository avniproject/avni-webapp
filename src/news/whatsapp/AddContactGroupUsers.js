import React, { useState } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Dialog from "@material-ui/core/Dialog";
import {
  Card,
  DialogActions,
  DialogTitle,
  LinearProgress,
  TextField,
  Typography
} from "@material-ui/core";
import _ from "lodash";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import { Close } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import SelectUser from "../../common/components/subject/SelectUser";
import UserService from "../../common/service/UserService";

const workflowStates = {
  Start: "Start",
  Searching: "Searching",
  SearchCompleted: "SearchCompleted"
};

const SearchUserAndConfirm = function({ onUserAdd, onCancel }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState(null);
  const [workflowState, setWorkflowState] = useState(workflowStates.Start);

  return (
    <Box style={{ flexDirection: "column", display: "flex" }}>
      <Card
        elevation={3}
        style={{
          flexDirection: "row",
          display: "flex",
          padding: 20,
          width: "100%",
          justifyContent: "space-between"
        }}
      >
        <Box>
          <Typography variant="body1">Name</Typography>
          <TextField
            name="name"
            autoComplete="off"
            type="text"
            onChange={e => setName(e.target.value)}
          />
        </Box>
        <Box>
          <Typography variant="body1">Phone number</Typography>
          <TextField
            name="name"
            autoComplete="off"
            type="text"
            onChange={e => setPhoneNumber(e.target.value)}
          />
        </Box>
        <Box>
          <Typography variant="body1">Email</Typography>
          <TextField
            name="email"
            autoComplete="off"
            type="text"
            onChange={e => setEmail(e.target.value)}
          />
        </Box>
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            setWorkflowState(workflowStates.Searching);
            UserService.searchUsers(name, phoneNumber, email)
              .then(usersPage => setUsers(usersPage.data))
              .then(() => setWorkflowState(workflowStates.SearchCompleted));
          }}
        >
          Search
        </Button>
      </Card>
      <hr />
      {workflowState === workflowStates.Searching && <LinearProgress />}
      <SelectUser users={users} onSelectedUser={setSelectedUser} />
      {users && (
        <Box style={{ flexDirection: "row-reverse", display: "flex", marginTop: 20 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => onCancel()}
            style={{ marginLeft: 15 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={_.isNil(selectedUser)}
            onClick={() => onUserAdd(selectedUser)}
          >
            Add
          </Button>
        </Box>
      )}
    </Box>
  );
};

const AddContactGroupUser = ({ onClose, onUserAdd, ...props }) => {
  const onCloseHandler = () => onClose();

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
      <Box style={{ padding: 20 }}>
        <SearchUserAndConfirm onUserAdd={x => onUserAdd(x)} onCancel={onCloseHandler} />
      </Box>
    </Dialog>
  );
};

const mapStateToProps = state => ({});

export default withRouter(connect(mapStateToProps)(AddContactGroupUser));
