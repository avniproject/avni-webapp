import React from "react";
import { styled } from '@mui/material/styles';
import { TextField, Box, Button, IconButton, Grid, FormHelperText, MenuItem } from "@mui/material";
import { map, includes, filter } from "lodash";
import { Delete } from "@mui/icons-material";
import httpClient from "../../common/utils/httpClient";
import { default as UUID } from "uuid";
import Types from "./Types";
import { AvniSelect } from "../../common/components/AvniSelect";

const StyledContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const StyledSelectContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledInputContainer = styled(Box)(({ theme }) => ({
  "& > *": {
    marginRight: theme.spacing(1),
    width: 200,
    marginTop: theme.spacing(1),
  },
}));

const StyledGrid = styled(Grid)(({ theme }) => ({
  alignItems: "center",
}));

const StyledAddButton = styled(Button)(({ theme }) => ({
  height: 35,
  marginTop: theme.spacing(2.5), // 20px
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  marginTop: theme.spacing(1.25), // 10px
}));

const StyledAvniSelect = styled(AvniSelect)(({ theme }) => ({
  width: 200,
  marginBottom: theme.spacing(0.625), // 5px
}));

export default function GroupRoles({ groupRoles, dispatch, error, edit, type, memberSubjectType }) {
  React.useEffect(() => {
    httpClient.fetchJson("/web/operationalModules").then((response) => {
      const json = response.json;
      json && setSubjectTypes(json.subjectTypes);
    });
  }, []);

  const [subjectTypeOptions, setSubjectTypes] = React.useState();
  const nonVoidedRoles = filter(groupRoles, ({ voided }) => !voided);

  const onGroupRoleChange = (groupRole, index) => {
    const existing = [...groupRoles];
    groupRole.voided = false;
    existing[index] = groupRole;
    dispatch({ type: "groupRole", payload: existing });
  };

  const onAddNewGroupRole = () => {
    const existing = [...groupRoles];
    existing.push({ voided: false, groupRoleUUID: UUID.v4() });
    dispatch({ type: "groupRole", payload: existing });
  };

  const onDeleteGroupRole = (index, groupRole, edit) => {
    const existing = [...groupRoles];
    existing.splice(index, 1);
    if (edit) {
      groupRole.voided = true;
      existing.push(groupRole);
    }
    dispatch({ type: "groupRole", payload: existing });
  };

  const filterOptions = (option) =>
    (Types.isHousehold(type) && includes(Types.householdMemberTypes, option.type)) ||
    (Types.getType("Group") === type && includes(Types.groupMemberTypes, option.type));

  return (
    <StyledContainer>
      <StyledSelectContainer>
        {Types.isHousehold(type) && (
          <StyledAvniSelect
            label="Select Member Subject *"
            value={memberSubjectType || ""}
            onChange={(event) => dispatch({ type: "householdMemberSubject", payload: event.target.value })}
            required
            options={
              subjectTypeOptions &&
              subjectTypeOptions.filter(filterOptions).map((option) => (
                <MenuItem key={option.uuid} value={option.name}>
                  {option.name}
                </MenuItem>
              ))
            }
            toolTipKey="APP_DESIGNER_SUBJECT_MEMBER_SUBJECT_TYPE"
          />
        )}
      </StyledSelectContainer>
      {map(nonVoidedRoles, (groupRole, index) => (
        <StyledGrid key={index} container direction="row">
          <StyledInputContainer noValidate autoComplete="off">
            <TextField
              disabled={Types.isHousehold(type)}
              id="role"
              label="Role Name"
              variant="outlined"
              value={groupRole.role || ""}
              onChange={(event) => onGroupRoleChange({ ...groupRole, role: event.target.value }, index)}
            />
            <TextField
              disabled={Types.isHousehold(type)}
              id="subject-member-name"
              select
              label="Select Member Subject"
              value={groupRole.subjectMemberName || ""}
              onChange={(event) =>
                onGroupRoleChange(
                  {
                    ...groupRole,
                    subjectMemberName: event.target.value,
                  },
                  index
                )
              }
              variant="outlined"
            >
              {subjectTypeOptions &&
                subjectTypeOptions.filter(filterOptions).map((option) => (
                  <MenuItem key={option.uuid} value={option.name}>
                    {option.name}
                  </MenuItem>
                ))}
            </TextField>
            <TextField
              disabled={Types.isHousehold(type)}
              id="minimum-number-of-members"
              label="Minimum members"
              variant="outlined"
              value={groupRole.minimumNumberOfMembers === "" ? "" : groupRole.minimumNumberOfMembers}
              onChange={(event) =>
                onGroupRoleChange(
                  {
                    ...groupRole,
                    minimumNumberOfMembers: +event.target.value.replace(/\D/g, ""),
                  },
                  index
                )
              }
            />
            <TextField
              disabled={Types.isHousehold(type)}
              id="maximum-number-of-members"
              label="Maximum members"
              variant="outlined"
              value={groupRole.maximumNumberOfMembers === "" ? "" : groupRole.maximumNumberOfMembers}
              onChange={(event) =>
                onGroupRoleChange(
                  {
                    ...groupRole,
                    maximumNumberOfMembers: +event.target.value.replace(/\D/g, ""),
                  },
                  index
                )
              }
            />
          </StyledInputContainer>
          {!Types.isHousehold(type) && (
            <StyledIconButton
              aria-label="delete"
              onClick={() => onDeleteGroupRole(index, groupRole, edit)}
            >
              <Delete fontSize="inherit" />
            </StyledIconButton>
          )}
        </StyledGrid>
      ))}
      {error && <FormHelperText error>Group fields can not be blank</FormHelperText>}
      {!Types.isHousehold(type) && (
        <StyledAddButton type="button" color="primary" onClick={onAddNewGroupRole}>
          Add Role
        </StyledAddButton>
      )}
    </StyledContainer>
  );
}