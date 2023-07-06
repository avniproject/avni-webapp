import React from "react";
import { Switch } from "@material-ui/core";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import MaterialTable from "material-table";
import { getGroupPrivilegeList, getGroups } from "../reducers";
import api from "../api";
import { Privilege } from "openchs-models";
import GroupPrivilegesModel from "../../common/model/GroupPrivilegesModel";
import _ from "lodash";

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

    const { PrivilegeType } = Privilege;

    groupPrivilegeList.forEach(groupPrivilege => {
      checkedState.set(groupPrivilege.uuid, { checkedState: groupPrivilege.allow });
      switch (groupPrivilege["privilegeType"]) {
        case PrivilegeType.VIEW_SUBJECT:
          dependencies.set(groupPrivilege.uuid, {
            dependencies: []
          });
          break;
        case PrivilegeType.REGISTER_SUBJECT:
        case PrivilegeType.EDIT_SUBJECT:
        case PrivilegeType.VOID_SUBJECT:
        case PrivilegeType.VIEW_ENROLMENT_DETAILS:
        case PrivilegeType.VIEW_VISIT:
        case PrivilegeType.VIEW_CHECKLIST:
        case PrivilegeType.ADD_MEMBER:
        case PrivilegeType.EDIT_MEMBER:
        case PrivilegeType.REMOVE_MEMBER:
        case PrivilegeType.APPROVE_SUBJECT:
        case PrivilegeType.REJECT_SUBJECT:
          dependencies.set(groupPrivilege.uuid, {
            dependencies: GroupPrivilegesModel.getSubjectTypeDependencies(
              groupPrivilegeList,
              groupPrivilege
            ).map(x => x.uuid)
          });
          break;
        case PrivilegeType.ENROL_SUBJECT:
        case PrivilegeType.EDIT_ENROLMENT_DETAILS:
        case PrivilegeType.EXIT_ENROLMENT:
        case PrivilegeType.APPROVE_ENROLMENT:
        case PrivilegeType.REJECT_ENROLMENT:
          dependencies.set(groupPrivilege.uuid, {
            dependencies: GroupPrivilegesModel.getProgramDependencies(
              groupPrivilegeList,
              groupPrivilege
            ).map(x => x.uuid)
          });
          break;
        case PrivilegeType.SCHEDULE_VISIT:
        case PrivilegeType.PERFORM_VISIT:
        case PrivilegeType.EDIT_VISIT:
        case PrivilegeType.CANCEL_VISIT:
        case PrivilegeType.VOID_VISIT:
        case PrivilegeType.APPROVE_ENCOUNTER:
        case PrivilegeType.REJECT_ENCOUNTER:
          dependencies.set(groupPrivilege.uuid, {
            dependencies: GroupPrivilegesModel.getEncounterTypeDependencies(
              groupPrivilegeList,
              groupPrivilege
            ).map(x => x.uuid)
          });
          break;
        case PrivilegeType.EDIT_CHECKLIST:
        case PrivilegeType.APPROVE_CHECKLISTITEM:
        case PrivilegeType.REJECT_CHECKLISTITEM:
          dependencies.set(groupPrivilege.uuid, {
            dependencies: GroupPrivilegesModel.getChecklistDependencies(
              groupPrivilegeList,
              groupPrivilege
            ).map(x => x.uuid)
          });
          break;
        default:
          dependencies.set(groupPrivilege.uuid, { dependencies: [] });
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
      groupPrivilegeId: _.get(privilege, "groupPrivilege.id"),
      groupId: privilege.groupId,
      privilegeId: privilege.privilegeId,
      subjectTypeId: _.get(privilege, "subjectType.id"),
      programId: _.get(privilege, "program.id"),
      programEncounterTypeId: _.get(privilege, "programEncounterType.id"),
      encounterTypeId: _.get(privilege, "encounterType.id"),
      checklistDetailId: _.get(privilege, "checklistDetail.id"),
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
    { title: "Subject Type", field: "subjectType.name", defaultGroupOrder: 0 },
    { title: "Entity Type", field: "privilegeEntityType" },
    { title: "Privilege", field: "privilegeName" },
    { title: "Program", field: "program.name" },
    { title: "Program Encounter Type", field: "programEncounterType.name", defaultSort: "asc" },
    { title: "General Encounter Type", field: "encounterType.name" },
    { title: "Checklist Detail", field: "checklistDetail.name" }
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
          label="All privileges"
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
