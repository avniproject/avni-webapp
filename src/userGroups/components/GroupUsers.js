import React, { useEffect, useRef, useState, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import Select from "react-select";
import { Button, Grid, Typography, IconButton } from "@mui/material";
import api from "../api";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { getGroupUsers, getAllUsers } from "../reducers";
import GroupModel from "../../common/model/GroupModel";
import { PersonAddDisabled } from "@mui/icons-material";

const GroupUsers = ({ getGroupUsers, getAllUsers, groupId, allUsers, groupUsers, ...props }) => {
  const [otherUsers, setOtherUsers] = useState([]);
  const [otherUsersOptions, setOtherUsersOptions] = useState([]);
  const [usersToBeAdded, setUsersToBeAdded] = useState([]);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const selectRef = useRef(null);

  useEffect(() => {
    getGroupUsers(groupId);
    getAllUsers();
  }, [getGroupUsers, getAllUsers, groupId]);

  useEffect(() => {
    if (allUsers && groupUsers) {
      setOtherUsers(allUsers.filter(user => !groupUsers.map(groupUser => groupUser.userId).includes(user.id)));
    }
  }, [allUsers, groupUsers]);

  useEffect(() => {
    setOtherUsersOptions(otherUsers.map(otherUser => ({ label: otherUser.username, value: otherUser.id })));
  }, [otherUsers]);

  const onUserListChange = event => {
    setUsersToBeAdded(event || []);
    setButtonDisabled(!event || event.length === 0);
  };

  const addUserToGroupHandler = event => {
    event.preventDefault();
    api
      .addUsersToGroup(usersToBeAdded.map(user => ({ userId: user.value, groupId })))
      .then(response => {
        const [response_data, error] = response;
        if (!response_data && error) {
          alert(error);
        } else if (response_data) {
          getGroupUsers(groupId);
          setUsersToBeAdded([]);
          setButtonDisabled(true);
        }
      })
      .catch(error => {
        console.error("Error adding users to group:", error);
        alert("Failed to add users");
      });
  };

  const removeUserFromGroupHandler = rowData => {
    api
      .removeUserFromGroup(rowData.id)
      .then(response => {
        const [response_data, error] = response;
        if (!response_data && error) {
          alert(error);
        } else if (response_data) {
          getGroupUsers(groupId);
        }
      })
      .catch(error => {
        console.error("Error removing user from group:", error);
        alert("Failed to remove user");
      });
  };

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name", enableGlobalFilter: false },
      { accessorKey: "userName", header: "Login ID", enableGlobalFilter: true },
      { accessorKey: "email", header: "Email", enableGlobalFilter: false },
      {
        id: "actions",
        header: "Remove",
        enableSorting: false,
        enableGlobalFilter: false,
        Cell: ({ row }) => (
          <IconButton
            title={row.original.groupName === GroupModel.Everyone ? "Cannot remove from Everyone group" : "Remove user from group"}
            disabled={row.original.groupName === GroupModel.Everyone}
            onClick={() => removeUserFromGroupHandler(row.original)}
          >
            <PersonAddDisabled />
          </IconButton>
        )
      }
    ],
    []
  );

  const selectStyles = {
    menu: provided => ({
      ...provided,
      zIndex: 10000 // Ensure dropdown is above table header
    })
  };

  return (
    <div style={{ width: "100%" }}>
      <h6>Select users to add to this group:</h6>
      <Grid container spacing={2} style={{ width: "100%" }}>
        <Grid size={10}>
          <Select
            name="addUserList"
            ref={selectRef}
            isMulti
            isSearchable
            options={otherUsersOptions}
            onChange={onUserListChange}
            value={usersToBeAdded}
            styles={selectStyles}
          />
        </Grid>
        <Grid size={2}>
          <Button variant="contained" color="primary" onClick={addUserToGroupHandler} disabled={buttonDisabled} fullWidth>
            Add user(s)
          </Button>
        </Grid>
      </Grid>
      <br />
      <hr />
      <Typography variant="h6">Group Members</Typography>
      <MaterialReactTable
        columns={columns}
        data={groupUsers || []}
        enableGlobalFilter
        enableColumnFilters={false}
        enableSorting
        muiTableHeadCellProps={{
          sx: { zIndex: 0 }
        }}
        muiSearchTextFieldProps={{
          sx: { float: "left" }
        }}
      />
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
