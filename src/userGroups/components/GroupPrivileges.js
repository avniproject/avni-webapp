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
import GroupModel from "../../common/model/GroupModel";
import materialTableIcons from "../../common/material-table/MaterialTableIcons";

const generatePrivilegeDependenciesAndCheckedState = function(groupPrivilegeList) {
  const dependencies = new Map();
  const checkedState = new Map();

  const { PrivilegeType } = Privilege;

  groupPrivilegeList.forEach(groupPrivilege => {
    checkedState.set(groupPrivilege.uuid, { checkedState: groupPrivilege.allow });
    switch (groupPrivilege["privilegeTypeName"]) {
      case PrivilegeType.ViewSubject:
        dependencies.set(groupPrivilege.uuid, {
          dependencies: []
        });
        break;
      case PrivilegeType.RegisterSubject:
      case PrivilegeType.EditSubject:
      case PrivilegeType.VoidSubject:
      case PrivilegeType.ViewEnrolmentDetails:
      case PrivilegeType.ViewVisit:
      case PrivilegeType.ViewChecklist:
      case PrivilegeType.AddMember:
      case PrivilegeType.EditMember:
      case PrivilegeType.RemoveMember:
      case PrivilegeType.ApproveSubject:
      case PrivilegeType.RejectSubject:
        dependencies.set(groupPrivilege.uuid, {
          dependencies: GroupPrivilegesModel.getSubjectTypeDependencies(groupPrivilegeList, groupPrivilege).map(x => x.uuid)
        });
        break;
      case PrivilegeType.EnrolSubject:
      case PrivilegeType.EditEnrolmentDetails:
      case PrivilegeType.ExitEnrolment:
      case PrivilegeType.ApproveEnrolment:
      case PrivilegeType.RejectEnrolment:
        dependencies.set(groupPrivilege.uuid, {
          dependencies: GroupPrivilegesModel.getProgramDependencies(groupPrivilegeList, groupPrivilege).map(x => x.uuid)
        });
        break;
      case PrivilegeType.ScheduleVisit:
      case PrivilegeType.PerformVisit:
      case PrivilegeType.EditVisit:
      case PrivilegeType.CancelVisit:
      case PrivilegeType.VoidVisit:
      case PrivilegeType.ApproveEncounter:
      case PrivilegeType.RejectEncounter:
        dependencies.set(groupPrivilege.uuid, {
          dependencies: GroupPrivilegesModel.getEncounterTypeDependencies(groupPrivilegeList, groupPrivilege).map(x => x.uuid)
        });
        break;
      case PrivilegeType.EditChecklist:
      case PrivilegeType.ApproveChecklistitem:
      case PrivilegeType.RejectChecklistitem:
        dependencies.set(groupPrivilege.uuid, {
          dependencies: GroupPrivilegesModel.getChecklistDependencies(groupPrivilegeList, groupPrivilege).map(x => x.uuid)
        });
        break;
      case PrivilegeType.EditUserGroup:
        dependencies.set(groupPrivilege.uuid, {
          dependencies: GroupPrivilegesModel.getEditUserGroupDependencies(groupPrivilegeList).map(x => x.uuid)
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

const modifyGroupPrivilegesToIncludeGroupingTypeColumn = function(groupPrivilegeList) {
  return groupPrivilegeList.map(gp => {
    return { ...gp, groupingTypeName: gp.subjectTypeName || gp.privilegeEntityType };
  });
};

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
  const [enhancedGroupPrivilegeList, setEnhancedGroupPrivilegeList] = React.useState(groupPrivilegeList);

  React.useEffect(() => {
    if (!allPrivilegesAllowed) {
      getGroupPrivilegeList(groupId);
    }
  }, []);

  React.useEffect(() => {
    if (!groupPrivilegeList) return;

    const [checkedState, dependencies] = generatePrivilegeDependenciesAndCheckedState(groupPrivilegeList);

    setPrivilegesCheckedState(checkedState);
    setPrivilegeDependencies(dependencies);
    setEnhancedGroupPrivilegeList(modifyGroupPrivilegesToIncludeGroupingTypeColumn(groupPrivilegeList));
  }, [groupPrivilegeList]);

  const onTogglePermissionClick = (event, rowData) => {
    let isAllow = event.target.checked;
    let deps;

    if (isAllow) {
      deps = privilegeDependencies.get(rowData.uuid).dependencies || [];
    } else {
      deps = privilegeDependencies.get(rowData.uuid).dependents || [];
    }

    let privilegeUuidsToBeUpdated = deps.filter(uuid => privilegesCheckedState.get(uuid).checkedState !== isAllow);

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
    let privilegesToBeUpdated = groupPrivilegeList.filter(groupPrivilege => privilegeUuidsToBeUpdated.includes(groupPrivilege.uuid));

    const request_body = privilegesToBeUpdated.map(privilege => ({
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
          checked={privilegesCheckedState ? privilegesCheckedState.get(rowData.uuid).checkedState : false}
        />
      )
    },
    { title: "Subject / Entity Type", field: "groupingTypeName", defaultGroupOrder: 0 },
    { title: "Subject Type", field: "subjectTypeName" },
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
              disabled={groupName === GroupModel.Administrators}
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
            icons={materialTableIcons}
            title=""
            columns={columns}
            data={enhancedGroupPrivilegeList}
            options={{
              grouping: true,
              pageSize: 20,
              headerStyle: {
                zIndex: 0
              },
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
