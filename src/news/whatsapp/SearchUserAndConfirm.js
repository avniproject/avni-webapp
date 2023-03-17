import React, { useState } from "react";
import _ from "lodash";
import Box from "@material-ui/core/Box";
import { Card, LinearProgress, TextField, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import UserService from "../../common/service/UserService";
import ErrorMessage from "../../common/components/ErrorMessage";
import SelectUser from "../../common/components/subject/SelectUser";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

const WorkflowStates = {
  Start: "Start",
  Searching: "Searching",
  SearchError: "SearchError",
  SearchCompleted: "SearchCompleted"
};

const SearchUserAndConfirm = function({ onUserSelected, confirmButtonText = "Confirm" }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [workflowState, setWorkflowState] = useState(WorkflowStates.Start);

  const displayError = _.includes([WorkflowStates.SearchError], workflowState);
  const displayProgress = _.includes([WorkflowStates.Searching], workflowState);

  return (
    <Box style={{ flexDirection: "column", display: "flex", flexGrow: 1 }}>
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
        <Box width={350}>
          <Typography variant="body1">Email</Typography>
          <TextField
            name="email"
            autoComplete="off"
            type="text"
            onChange={e => setEmail(e.target.value)}
            fullWidth
          />
        </Box>
        <Box>
          <Typography variant="body1">Phone number</Typography>
          <TextField
            name="phone"
            autoComplete="off"
            type="text"
            onChange={e => setPhoneNumber(e.target.value)}
          />
        </Box>
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            setWorkflowState(WorkflowStates.Searching);
            UserService.searchUsers(name, phoneNumber, email)
              .then(usersPage => setUsers(usersPage.data))
              .then(() => setWorkflowState(WorkflowStates.SearchCompleted))
              .catch(error => {
                setError(error);
                setWorkflowState(WorkflowStates.SearchError);
              });
          }}
        >
          Search
        </Button>
      </Card>
      <hr />
      {displayProgress && <LinearProgress />}
      {displayError && <ErrorMessage error={error} />}
      <SelectUser users={users} onSelectedUser={setSelectedUser} />
      {users && (
        <Box style={{ flexDirection: "row-reverse", display: "flex", marginTop: 20 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setUsers(null)}
            style={{ marginLeft: 15 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={_.isNil(selectedUser)}
            onClick={() => onUserSelected(selectedUser)}
          >
            {confirmButtonText}
          </Button>
        </Box>
      )}
    </Box>
  );
};

const mapStateToProps = state => ({});

export default withRouter(connect(mapStateToProps)(SearchUserAndConfirm));
