import React from "react";
import { Switch } from "@material-ui/core";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import MaterialTable from "material-table";
import { getGroupPrivilegeList } from "../reducers";
import api from "../api";

const GroupPrivileges = ({ groupId, getGroupPrivilegeList, groupPrivilegeList }) => {
  const [privilegesMetadata, setPrivilegesMetadata] = React.useState(null);

  React.useEffect(() => {
    getGroupPrivilegeList(groupId);
  }, []);

  React.useEffect(() => {
    if (!groupPrivilegeList) return;

    let metadata = new Map();

    groupPrivilegeList.forEach(privilegeListItem => {
      switch (privilegeListItem.privilegeId) {
        case 1: // View subject
          metadata.set(privilegeListItem.tableData.id, {
            checkedState: privilegeListItem.allow,
            dependencies: []
          });
          break;
        case 2: // Register subject
        case 3: // Edit subject
        case 4: // Void subject
        case 6: // View enrolment details
        case 9: // View visit
        case 14: // View checklist
          metadata.set(privilegeListItem.tableData.id, {
            checkedState: privilegeListItem.allow,
            dependencies: groupPrivilegeList
              .filter(
                privilege =>
                  privilege.privilegeId === 1 &&
                  privilege.subjectTypeId === privilegeListItem.subjectTypeId
              )
              .map(filteredPrivileges => filteredPrivileges.tableData.id)
          });
          break;
        case 5: // Enrol subject
        case 7: // Edit enrolment details
        case 8: // Exit enrolment
          metadata.set(privilegeListItem.tableData.id, {
            checkedState: privilegeListItem.allow,
            dependencies: groupPrivilegeList
              .filter(
                privilege =>
                  (privilege.privilegeId === 6 &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId &&
                    privilege.programId === privilegeListItem.programId) ||
                  (privilege.privilegeId === 1 &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId)
              )
              .map(filteredPrivileges => filteredPrivileges.tableData.id)
          });
          break;
        case 10: // Schedule visit
        case 11: // Perform visit
        case 12: // Edit visit
        case 13: // Cancel visit
          metadata.set(privilegeListItem.tableData.id, {
            checkedState: privilegeListItem.allow,
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
              .map(filteredPrivileges => filteredPrivileges.tableData.id)
          });
          break;
        case 15: // Edit checklist
          metadata.set(privilegeListItem.tableData.id, {
            checkedState: privilegeListItem.allow,
            dependencies: groupPrivilegeList
              .filter(
                privilege =>
                  (privilege.privilegeId === 14 &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId &&
                    privilege.checklistDetailId === privilegeListItem.checklistDetailId) ||
                  (privilege.privilegeId === 1 &&
                    privilege.subjectTypeId === privilegeListItem.subjectTypeId)
              )
              .map(filteredPrivileges => filteredPrivileges.tableData.id)
          });
          break;
        default:
          break;
      }
    });

    for (let [key, value] of metadata) {
      let dependency_keys = value.dependencies;
      let current_metadata;
      if (!(dependency_keys === undefined)) {
        dependency_keys.forEach(dep_key => {
          current_metadata = metadata.get(dep_key);
          if (!current_metadata.dependents) {
            current_metadata.dependents = [];
          }
          current_metadata.dependents.push(key);
        });
      }
    }
    setPrivilegesMetadata(metadata);
  }, [groupPrivilegeList]);

  React.useEffect(() => {}, [privilegesMetadata]);

  const onTogglePermissionClick = (event, rowData) => {
    let isAllow = event.target.checked;
    let indexesToBeUpdated;

    if (isAllow) {
      indexesToBeUpdated = privilegesMetadata.get(rowData.tableData.id).dependencies || [];
    } else {
      indexesToBeUpdated = privilegesMetadata.get(rowData.tableData.id).dependents || [];
    }

    indexesToBeUpdated.push(rowData.tableData.id);

    let toggleAllowMap = new Map();
    indexesToBeUpdated.forEach(index => {
      toggleAllowMap.set(index, {
        checkedState: isAllow,
        dependents: privilegesMetadata.get(index).dependents || [],
        dependencies: privilegesMetadata.get(index).dependencies || []
      });
    });

    setPrivilegesMetadata(new Map([...privilegesMetadata, ...toggleAllowMap]));

    let privilegesToBeUpdated = groupPrivilegeList.filter(
      privilege =>
        indexesToBeUpdated.includes(privilege.tableData.id) && privilege.allow !== isAllow
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
      allow: isAllow
    }));

    api.modifyGroupPrivileges(request_body).then(response => {
      const [response_data, error] = response;
      if (!response_data && error) {
        alert(error);
      }
    });
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
            privilegesMetadata ? privilegesMetadata.get(rowData.tableData.id).checkedState : false
          }
        />
      )
    },
    { title: "Subject Type", field: "subjectTypeName", defaultGroupOrder: 0 },
    { title: "Entity Type", field: "privilegeEntityType", defaultGroupOrder: 0 },
    { title: "Privilege", field: "privilegeName" },
    { title: "Program", field: "programName" },
    { title: "Program Encounter Type", field: "programEncounterTypeName" },
    { title: "General Encounter Type", field: "encounterTypeName" },
    { title: "Checklist Detail", field: "checklistDetailName" }
  ];
  return (
    <div>
      <MaterialTable
        title="Privilege List"
        columns={columns}
        data={groupPrivilegeList}
        options={{
          grouping: true,
          pageSize: 30
        }}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  groupPrivilegeList: state.userGroups.groupPrivilegeList
});

export default withRouter(
  connect(
    mapStateToProps,
    { getGroupPrivilegeList }
  )(GroupPrivileges)
);
