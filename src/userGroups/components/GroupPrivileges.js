import React from "react";
import { Switch } from "@material-ui/core";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import MaterialTable from "material-table";
import { getGroupPrivilegeList, getGroups } from "../reducers";
import api from "../api";

const VIEW_SUBJECT = "ViewSubject";
const REGISTER_SUBJECT = "RegisterSubject";
const EDIT_SUBJECT = "EditSubject";
const VOID_SUBJECT = "VoidSubject";
const ENROL_SUBJECT = "EnrolSubject";
const VIEW_ENROLMENT_DETAILS = "ViewEnrolmentDetails";
const EDIT_ENROLMENT_DETAILS = "EditEnrolmentDetails";
const EXIT_ENROLMENT = "ExitEnrolment";
const VIEW_VISIT = "ViewVisit";
const SCHEDULE_VISIT = "ScheduleVisit";
const PERFORM_VISIT = "PerformVisit";
const EDIT_VISIT = "EditVisit";
const CANCEL_VISIT = "CancelVisit";
const VOID_VISIT = "VoidVisit";
const VIEW_CHECKLIST = "ViewChecklist";
const EDIT_CHECKLIST = "EditChecklist";
const ADD_MEMBER = "AddMember";
const EDIT_MEMBER = "EditMember";
const REMOVE_MEMBER = "RemoveMember";
const APPROVE_SUBJECT = "ApproveSubject";
const REJECT_SUBJECT = "RejectSubject";
const APPROVE_ENROLMENT = "ApproveEnrolment";
const REJECT_ENROLMENT = "RejectEnrolment";
const APPROVE_ENCOUNTER = "ApproveEncounter";
const REJECT_ENCOUNTER = "RejectEncounter";
const APPROVE_CHECKLISTITEM = "ApproveChecklistitem";
const REJECT_CHECKLISTITEM = "RejectChecklistitem";

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
      switch (privilegeListItem.type) {
        case VIEW_SUBJECT:
          dependencies.set(privilegeListItem.uuid, {
            dependencies: []
          });
          break;
        case REGISTER_SUBJECT:
        case EDIT_SUBJECT:
        case VOID_SUBJECT:
        case VIEW_ENROLMENT_DETAILS:
        case VIEW_VISIT:
        case VIEW_CHECKLIST:
        case ADD_MEMBER:
        case EDIT_MEMBER:
        case REMOVE_MEMBER:
          dependencies.set(privilegeListItem.uuid, {
            dependencies: groupPrivilegeList
              .filter(
                privilege =>
                  privilege.privilegeName === VIEW_SUBJECT &&
                  privilege.subjectTypeId === privilegeListItem.subjectTypeId
              )
              .map(filteredPrivileges => filteredPrivileges.uuid)
          });
          break;
        case APPROVE_SUBJECT:
        case REJECT_SUBJECT:
          dependencies.set(privilegeListItem.uuid, {
            dependencies: groupPrivilegeList
              .filter(
                privilege =>
                  privilege.privilegeName === VIEW_SUBJECT &&
                  privilege.subjectTypeId === privilegeListItem.subjectTypeId
              )
              .map(filteredPrivileges => filteredPrivileges.uuid)
          });
          break;
        case ENROL_SUBJECT:
        case EDIT_ENROLMENT_DETAILS:
        case EXIT_ENROLMENT:
          dependencies.set(privilegeListItem.uuid, {
            dependencies: groupPrivilegeList
              .filter(
                privilege =>
                  (privilege.privilegeName === VIEW_ENROLMENT_DETAILS &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId &&
                    privilege.programId === privilegeListItem.programId) ||
                  (privilege.privilegeName === VIEW_SUBJECT &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId)
              )
              .map(filteredPrivileges => filteredPrivileges.uuid)
          });
          break;
        case APPROVE_ENROLMENT:
        case REJECT_ENROLMENT:
          dependencies.set(privilegeListItem.uuid, {
            dependencies: groupPrivilegeList
              .filter(
                privilege =>
                  (privilege.privilegeName === VIEW_ENROLMENT_DETAILS &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId &&
                    privilege.programId === privilegeListItem.programId) ||
                  (privilege.privilegeName === VIEW_SUBJECT &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId)
              )
              .map(filteredPrivileges => filteredPrivileges.uuid)
          });
          break;
        case SCHEDULE_VISIT:
        case PERFORM_VISIT:
        case EDIT_VISIT:
        case CANCEL_VISIT:
        case VOID_VISIT:
          dependencies.set(privilegeListItem.uuid, {
            dependencies: groupPrivilegeList
              .filter(
                privilege =>
                  (privilege.privilegeName === VIEW_VISIT &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId &&
                    privilege.encounterTypeId === privilegeListItem.encounterTypeId &&
                    privilege.programEncounterTypeId === privilegeListItem.programEncounterTypeId &&
                    privilege.programId === privilegeListItem.programId) ||
                  (privilege.privilegeName === VIEW_SUBJECT &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId)
              )
              .map(filteredPrivileges => filteredPrivileges.uuid)
          });
          break;
        case APPROVE_ENCOUNTER:
        case REJECT_ENCOUNTER:
          dependencies.set(privilegeListItem.uuid, {
            dependencies: groupPrivilegeList
              .filter(
                privilege =>
                  (privilege.privilegeName === VIEW_VISIT &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId &&
                    privilege.encounterTypeId === privilegeListItem.encounterTypeId &&
                    privilege.programEncounterTypeId === privilegeListItem.programEncounterTypeId &&
                    privilege.programId === privilegeListItem.programId) ||
                  (privilege.privilegeName === VIEW_SUBJECT &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId)
              )
              .map(filteredPrivileges => filteredPrivileges.uuid)
          });
          break;
        case EDIT_CHECKLIST:
          dependencies.set(privilegeListItem.uuid, {
            dependencies: groupPrivilegeList
              .filter(
                privilege =>
                  (privilege.privilegeName === VIEW_CHECKLIST &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId &&
                    privilege.checklistDetailId === privilegeListItem.checklistDetailId) ||
                  (privilege.privilegeName === VIEW_SUBJECT &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId)
              )
              .map(filteredPrivileges => filteredPrivileges.uuid)
          });
          break;
        case APPROVE_CHECKLISTITEM:
        case REJECT_CHECKLISTITEM:
          dependencies.set(privilegeListItem.uuid, {
            dependencies: groupPrivilegeList
              .filter(
                privilege =>
                  (privilege.privilegeName === VIEW_CHECKLIST &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId &&
                    privilege.checklistDetailId === privilegeListItem.checklistDetailId) ||
                  (privilege.privilegeName === VIEW_SUBJECT &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId)
              )
              .map(filteredPrivileges => filteredPrivileges.uuid)
          });
          break;
        default:
          dependencies.set(privilegeListItem.uuid, { dependencies: [] });
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
