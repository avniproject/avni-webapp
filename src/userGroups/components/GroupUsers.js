import React from "react";
import MaterialTable from "material-table";
import Select from "react-select";
import Button from "@material-ui/core/Button";
import api from "../api";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { getGroupUsers, getAllUsers } from "../reducers";

const GroupUsers = ({ getGroupUsers, getAllUsers, groupId, allUsers, groupUsers, ...props }) => {
  const [otherUsers, setOtherUsers] = React.useState([]);
  const [otherUsersOptions, setOtherUsersOptions] = React.useState([]);
  const otherUsersOptionsRef = React.useRef(null);

  React.useEffect(() => {
    getGroupUsers(groupId);
    getAllUsers();
  }, []);

  React.useEffect(() => {
    if (allUsers && groupUsers) {
      setOtherUsers(
        allUsers.data.filter(
          user => !groupUsers.map(groupUser => groupUser.userId).includes(user.id)
        )
      );
    }
  }, [allUsers, groupUsers]);

  React.useEffect(() => {
    setOtherUsersOptions(
      otherUsers.map(otherUser => ({ label: otherUser.username, value: otherUser.id }))
    );
  }, [otherUsers]);

  const [usersToBeAdded, setUsersToBeAdded] = React.useState([]);
  const [buttonDisabled, setButtonDisabled] = React.useState(true);

  const onUserListChange = event => {
    setUsersToBeAdded(event);
    event && event.length > 0 ? setButtonDisabled(false) : setButtonDisabled(true);
  };

  const addUserToGroupHandler = event => {
    event.preventDefault();
    otherUsersOptionsRef.current.select.clearValue();

    api
      .addUsersToGroup(usersToBeAdded.map(user => ({ userId: user.value, groupId })))
      .then(response => {
        const [response_data, error] = response;
        if (!response_data && error) {
          alert(error);
        } else if (response_data) {
          getGroupUsers(groupId);
        }
      });
  };

  const removeUserFromGroupHandler = (event, rowData) => {
    api.removeUserFromGroup(rowData.id).then(response => {
      const [response_data, error] = response;
      if (!response_data && error) {
        alert(error);
      } else if (response_data) {
        getGroupUsers(groupId);
      }
    });
  };

  const columns = [
    { title: "Name", field: "name" },
    { title: "Login ID", field: "userName" },
    { title: "Email", field: "email" }
  ];
  return (
    <div>
      <MaterialTable
        title=""
        columns={columns}
        data={groupUsers}
        actions={[
          rowData => ({
            //          icon: 'remove_circle_outline',
            icon: "person_add_disabled",
            tooltip: "Remove user from group",
            onClick: (event, rowData) => removeUserFromGroupHandler(event, rowData),
            disabled: rowData.groupName === "Everyone"
          })
        ]}
        options={{
          actionsColumnIndex: 3,
          searchFieldAlignment: "left"
        }}
        localization={{
          header: { actions: "Remove" }
        }}
      />
      <br />
      <hr />
      Select users to add to this group:
      <br />
      <Select
        name="addUserList"
        ref={otherUsersOptionsRef}
        isMulti
        isSearchable
        options={otherUsersOptions}
        onChange={onUserListChange}
      />
      <br />
      <Button
        variant="contained"
        color="primary"
        onClick={event => addUserToGroupHandler(event)}
        disabled={buttonDisabled}
      >
        Add user(s)
      </Button>
    </div>
  );
};

const mapStateToProps = state => ({
  groupUsers: state.userGroups.groupUsers,
  allUsers: state.userGroups.allUsers
});

export default withRouter(
  connect(
    mapStateToProps,
    { getGroupUsers, getAllUsers }
  )(GroupUsers)
);
