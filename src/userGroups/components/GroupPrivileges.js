import React from "react";
import { Switch } from "@material-ui/core";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import MaterialTable from "material-table";
import { getGroupPrivilegeList, getGroups } from "../reducers";
import api from "../api";

const GroupPrivileges = ({
  groupId,
  hasAllPrivileges,
  setHasAllPrivileges,
  groupName,
  getGroups,
  getGroupPrivilegeList,
  groupPrivilegeList
}) => {
  const [privilegeDependencies, setPrivilegeDependencies] = React.useState(null);
  const [privilegesCheckedState, setPrivilegesCheckedState] = React.useState(null);
  const [allPrivilegesAllowed, setAllPrivilegesAllowed] = React.useState(hasAllPrivileges);

  React.useEffect(() => {
    groupPrivilegeList = null;
    if (!allPrivilegesAllowed) {
      getGroupPrivilegeList(groupId);
    }
  }, []);

  React.useEffect(() => {
    if (!groupPrivilegeList) return;

    const [checkedState, dependencies] = generatePrivilegeDependenciesAndCheckedState();

    setPrivilegesCheckedState(checkedState);

    setPrivilegeDependencies(dependencies);
  }, [groupPrivilegeList]);

  const generatePrivilegeDependenciesAndCheckedState = () => {
    let dependencies = new Map();
    let checkedState = new Map();

    groupPrivilegeList.forEach(privilegeListItem => {
      checkedState.set(privilegeListItem.uuid, { checkedState: privilegeListItem.allow });
      switch (privilegeListItem.privilegeId) {
        case 1: // View subject
          dependencies.set(privilegeListItem.uuid, {
            dependencies: []
          });
          break;
        case 2: // Register subject
        case 3: // Edit subject
        case 4: // Void subject
        case 6: // View enrolment details
        case 9: // View visit
        case 14: // View checklist
        case 16: // Add member
        case 17: // Edit member
        case 18: // Remove member
          dependencies.set(privilegeListItem.uuid, {
            dependencies: groupPrivilegeList
              .filter(
                privilege =>
                  privilege.privilegeId === 1 &&
                  privilege.subjectTypeId === privilegeListItem.subjectTypeId
              )
              .map(filteredPrivileges => filteredPrivileges.uuid)
          });
          break;
        case 5: // Enrol subject
        case 7: // Edit enrolment details
        case 8: // Exit enrolment
          dependencies.set(privilegeListItem.uuid, {
            dependencies: groupPrivilegeList
              .filter(
                privilege =>
                  (privilege.privilegeId === 6 &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId &&
                    privilege.programId === privilegeListItem.programId) ||
                  (privilege.privilegeId === 1 &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId)
              )
              .map(filteredPrivileges => filteredPrivileges.uuid)
          });
          break;
        case 10: // Schedule visit
        case 11: // Perform visit
        case 12: // Edit visit
        case 13: // Cancel visit
          dependencies.set(privilegeListItem.uuid, {
            dependencies: groupPrivilegeList
              .filter(
                privilege =>
                  (privilege.privilegeId === 9 &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId &&
                    privilege.encounterTypeId === privilegeListItem.encounterTypeId &&
                    privilege.programEncounterTypeId === privilegeListItem.programEncounterTypeId &&
                    privilege.programId === privilegeListItem.programId) ||
                  (privilege.privilegeId === 1 &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId)
              )
              .map(filteredPrivileges => filteredPrivileges.uuid)
          });
          break;
        case 15: // Edit checklist
          dependencies.set(privilegeListItem.uuid, {
            dependencies: groupPrivilegeList
              .filter(
                privilege =>
                  (privilege.privilegeId === 14 &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId &&
                    privilege.checklistDetailId === privilegeListItem.checklistDetailId) ||
                  (privilege.privilegeId === 1 &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId)
              )
              .map(filteredPrivileges => filteredPrivileges.uuid)
          });
          break;
        default:
          break;
      }
    });

    for (let [key, value] of dependencies) {
      let dependency_keys = value.dependencies;
      let current_dependencies;
      if (!(dependency_keys === undefined)) {
        dependency_keys.forEach(dep_key => {
          current_dependencies = dependencies.get(dep_key);
          if (!current_dependencies.dependents) {
            current_dependencies.dependents = [];
          }
          current_dependencies.dependents.push(key);
        });
      }
    }
    return [checkedState, dependencies];
  };

  const onTogglePermissionClick = (event, rowData) => {
    let isAllow = event.target.checked;
    let deps;

    if (isAllow) {
      deps = privilegeDependencies.get(rowData.uuid).dependencies || [];
    } else {
      deps = privilegeDependencies.get(rowData.uuid).dependents || [];
    }

    let privilegeUuidsToBeUpdated = deps.filter(
      uuid => privilegesCheckedState.get(uuid).checkedState !== isAllow
    );

    privilegeUuidsToBeUpdated.push(rowData.uuid);

    let toggleCheckedStateMap = new Map();
    privilegeUuidsToBeUpdated.forEach(index => {
      toggleCheckedStateMap.set(index, {
        checkedState: isAllow
      });
    });

    setPrivilegesCheckedState(new Map([...privilegesCheckedState, ...toggleCheckedStateMap]));

    modifyGroupPrivileges(privilegeUuidsToBeUpdated, isAllow);
  };

  const modifyGroupPrivileges = (privilegeUuidsToBeUpdated, isAllow) => {
    let privilegesToBeUpdated = groupPrivilegeList.filter(groupPrivilege =>
      privilegeUuidsToBeUpdated.includes(groupPrivilege.uuid)
    );

    let request_body = privilegesToBeUpdated.map(privilege => ({
      groupPrivilegeId: privilege.groupPrivilegeId,
      groupId: privilege.groupId,
      privilegeId: privilege.privilegeId,
      subjectTypeId: privilege.subjectTypeId,
      programId: privilege.programId,
      programEncounterTypeId: privilege.programEncounterTypeId,
      encounterTypeId: privilege.encounterTypeId,
      checklistDetailId: privilege.checklistDetailId,
      allow: isAllow,
      uuid: privilege.uuid
    }));

    api.modifyGroupPrivileges(request_body).then(response => {
      const [response_data, error] = response;
      if (!response_data && error) {
        alert(error);
        getGroupPrivilegeList(groupId);
      }
    });
  };

  const onToggleAllPrivileges = event => {
    let allowOptionSelected = event.target.checked;
    api.updateGroup(groupId, groupName, allowOptionSelected).then(response => {
      const [response_data, error] = response;
      if (!response_data && error) {
        alert(error);
      }
      getGroups();
    });

    if (!allowOptionSelected) {
      getGroupPrivilegeList(groupId);
    }
    setAllPrivilegesAllowed(allowOptionSelected);
    setHasAllPrivileges(allowOptionSelected);
  };

  const columns = [
    {
      title: "Allowed",
      field: "allow",
      type: "boolean",
      grouping: false,
      render: rowData => (
        <Switch
          onChange={event => onTogglePermissionClick(event, rowData)}
          checked={
            privilegesCheckedState ? privilegesCheckedState.get(rowData.uuid).checkedState : false
          }
        />
      )
    },
    { title: "Subject Type", field: "subjectTypeName", defaultGroupOrder: 0 },
    { title: "Entity Type", field: "privilegeEntityType" },
    { title: "Privilege", field: "privilegeName" },
    { title: "Program", field: "programName" },
    { title: "Program Encounter Type", field: "programEncounterTypeName", defaultSort: "asc" },
    { title: "General Encounter Type", field: "encounterTypeName" },
    { title: "Checklist Detail", field: "checklistDetailName" }
  ];
  return (
    <div>
      <FormGroup row>
        <FormControlLabel
          control={
            <Switch
              onChange={event => onToggleAllPrivileges(event)}
              checked={allPrivilegesAllowed}
            />
          }
          label="Use default privileges. (All users are allowed to access all features.)"
        />
      </FormGroup>
      {!allPrivilegesAllowed && (
        <div>
          <hr />
          <br />
          <MaterialTable
            title=""
            columns={columns}
            data={groupPrivilegeList}
            options={{
              grouping: true,
              pageSize: 20,
              searchFieldAlignment: "left"
              // filtering: true
            }}
          />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = state => ({
  groupPrivilegeList: state.userGroups.groupPrivilegeList
});

export default withRouter(
  connect(
    mapStateToProps,
    { getGroups, getGroupPrivilegeList }
  )(GroupPrivileges)
);
