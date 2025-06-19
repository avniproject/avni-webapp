import _, { split, map, isEmpty, isNil } from "lodash";
import { getSyncAttributes } from "../reducers/SubjectAssignmentReducer";
import React from "react";
import { Chip } from "@mui/material";
import SubjectAssignmentMultiSelect from "./SubjectAssignmentMultiSelect";
import GroupModel from "../../common/model/GroupModel";
import { styled } from "@mui/material/styles";

const MultiSelectWrapper = styled("div")({
  position: "relative",
  zIndex: 1000,
  minWidth: "200px",
  minHeight: "40px",
  "& .dropdown-menu": {
    // Target react-multiselect-checkboxes dropdown
    zIndex: 2000,
    position: "absolute",
    maxHeight: "300px",
    overflowY: "auto",
    width: "auto !important"
  }
});

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

  function getFormattedUserAndGroups(user) {
    const groupNames = `${user.userGroups
      .filter(ug => ug.groupName !== GroupModel.Everyone)
      .map(ug => ug.groupName)
      .join(", ")}`;
    if (groupNames.length > 0) {
      return `${user.name} (${groupNames})`;
    } else {
      return `${user.name}`;
    }
  }

  const fixedColumns = [
    {
      header: "Name",
      accessorFn: row => row.fullName,
      size: 100,
      muiTableBodyCellProps: { sx: { width: "10%" } },
      muiTableHeadCellProps: { sx: { width: "10%" } },
      Cell: ({ row }) => (
        <a href={`/#/app/subject?uuid=${row.original.uuid}`} target="_blank" rel="noopener noreferrer">
          {row.original.fullName}
        </a>
      )
    },
    {
      header: "Address",
      accessorKey: "addressLevel",
      size: 250,
      muiTableBodyCellProps: { sx: { width: "25%" } },
      muiTableHeadCellProps: { sx: { width: "25%" } }
    },
    {
      header: "Programs",
      accessorFn: row => row.programs,
      size: 250,
      muiTableBodyCellProps: { sx: { width: "25%" } },
      muiTableHeadCellProps: { sx: { width: "25%" } },
      Cell: ({ row }) => getFormattedPrograms(row.original.programs)
    },
    {
      header: "Assigned to",
      accessorFn: row => row.assignedUsers,
      size: 400,
      muiTableBodyCellProps: { sx: { width: "40%", overflow: "visible", position: "relative", zIndex: 1 } },
      muiTableHeadCellProps: { sx: { width: "40%" } },
      Cell: ({ row }) => {
        const options = getUserOptions(row.original, metadata.users);
        const selectedOptions = getSelectedUserOptions(row.original, row.original.assignedUsers);
        return (
          <MultiSelectWrapper>
            <SubjectAssignmentMultiSelect options={options} selectedOptions={selectedOptions} />
          </MultiSelectWrapper>
        );
      }
    }
  ];

  addSyncAttributeColumnIfRequired(syncAttribute1, fixedColumns);
  addSyncAttributeColumnIfRequired(syncAttribute2, fixedColumns);

  return fixedColumns;
};

const addSyncAttributeColumnIfRequired = (syncAttribute, fixedColumns) => {
  if (!isNil(syncAttribute)) {
    fixedColumns.push({
      header: syncAttribute.name,
      accessorKey: syncAttribute.name,
      size: 150
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
