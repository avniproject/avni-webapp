import _, { split, map, isEmpty, isNil } from "lodash";
import { getSyncAttributes } from "../reducers/SubjectAssignmentReducer";
import React from "react";
import Chip from "@material-ui/core/Chip";
import SubjectAssignmentMultiSelect from "./SubjectAssignmentMultiSelect";

export const getColumns = (metadata, filterCriteria) => {
  const { syncAttribute1, syncAttribute2 } = getSyncAttributes(metadata, filterCriteria);

  function getUserOptions(row, users) {
    let userDropdownValues = [];
    _.map(users, user =>
      userDropdownValues.push({
        subjectId: row.id,
        id: user.id,
        label: user.name,
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
        label: assignedUser.name,
        value: assignedUser.uuid
      })
    );

    return userDropdownSelectedValues;
  }

  const fixedColumns = [
    {
      title: "Name",
      render: row => (
        <a href={`/#/app/subject?uuid=${row.uuid}`} target="_blank" rel="noopener noreferrer">
          {row.fullName}
        </a>
      )
    },
    {
      title: "Address",
      field: "addressLevel"
    },
    {
      title: "Programs",
      render: row => getFormattedPrograms(row.programs)
    },
    {
      title: "Assignment",
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
