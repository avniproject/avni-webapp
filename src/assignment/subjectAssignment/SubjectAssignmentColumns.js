import _, { split, map, isEmpty, isNil } from "lodash";
import { getSyncAttributes } from "../reducers/SubjectAssignmentReducer";
import React from "react";
import { Chip } from "@mui/material";
import SubjectAssignmentMultiSelect from "./SubjectAssignmentMultiSelect";
import GroupModel from "../../common/model/GroupModel";

export const getColumns = (metadata, filterCriteria) => {
  const { syncAttribute1, syncAttribute2 } = getSyncAttributes(metadata, filterCriteria);

  function getUserOptions(row, users) {
    let userDropdownValues = [];
    _.map(users, user =>
      userDropdownValues.push({
        subjectId: row.id,
        id: user.id,
        label: getFormattedUserAndGroups(user),
        value: user.uuid
      })
    );
    return userDropdownValues;
  }

  function getSelectedUserOptions(row, assignedUsers) {
    let userDropdownSelectedValues = [];
    _.map(assignedUsers, assignedUser =>
      userDropdownSelectedValues.push({
        subjectId: row.id,
        id: assignedUser.id,
        label: getFormattedUserAndGroups(assignedUser),
        value: assignedUser.uuid
      })
    );
    return userDropdownSelectedValues;
  }

  const getFormattedUserAndGroups = user => {
    const groupNames = `${user.userGroups
      .filter(ug => ug.groupName !== GroupModel.Everyone)
      .map(ug => ug.groupName)
      .join(", ")}`;
    if (groupNames.length > 0) {
      return `${user.name} (${groupNames})`;
    } else {
      return `${user.name}`;
    }
  };

  const fixedColumns = [
    {
      title: "Name",
      cellStyle: { width: "10%" },
      width: "10%",
      headerStyle: { width: "10%" },
      render: row => (
        <a href={`/#/app/subject?uuid=${row.uuid}`} target="_blank" rel="noopener noreferrer">
          {row.fullName}
        </a>
      )
    },
    {
      title: "Address",
      field: "addressLevel",
      cellStyle: { width: "25%" },
      width: "25%",
      headerStyle: { width: "25%" }
    },
    {
      title: "Programs",
      cellStyle: { width: "25%" },
      width: "25%",
      headerStyle: { width: "25%" },
      render: row => getFormattedPrograms(row.programs)
    },
    {
      title: "Assigned to",
      cellStyle: { width: "40%" },
      width: "40%",
      headerStyle: { width: "40%" },
      render: row => (
        <SubjectAssignmentMultiSelect
          options={getUserOptions(row, metadata.users)}
          selectedOptions={getSelectedUserOptions(row, row.assignedUsers)}
        />
      )
    }
  ];
  addSyncAttributeColumnIfRequired(syncAttribute1, fixedColumns);
  addSyncAttributeColumnIfRequired(syncAttribute2, fixedColumns);

  return fixedColumns;
};

const addSyncAttributeColumnIfRequired = (syncAttribute, fixedColumns) => {
  if (!isNil(syncAttribute)) {
    fixedColumns.push({
      title: syncAttribute.name,
      field: syncAttribute.name
    });
  }
};

const getFormattedPrograms = programColorString => {
  if (isEmpty(programColorString)) return "";
  const programAndColorArray = split(programColorString, ",");
  return map(programAndColorArray, (singleProgramAndColor, index) => {
    const programAndColor = split(singleProgramAndColor, ":");

    return getChip(programAndColor[0], programAndColor[1], index);
  });
};

const getChip = (label, colour, key) => {
  return (
    <Chip
      key={key}
      size="small"
      label={label}
      style={{
        margin: 2,
        backgroundColor: colour,
        color: "white"
      }}
    />
  );
};
