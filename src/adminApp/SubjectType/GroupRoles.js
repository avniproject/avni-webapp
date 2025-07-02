import React from "react";
import { makeStyles } from "@mui/styles";
import { TextField, Box, Button, IconButton, Grid, FormHelperText, MenuItem } from "@mui/material";
import { map, includes, filter } from "lodash";
import { Delete } from "@mui/icons-material";
import httpClient from "../../common/utils/httpClient";
import { default as UUID } from "uuid";
import Types from "./Types";
import { AvniSelect } from "../../common/components/AvniSelect";

const useStyles = makeStyles(theme => ({
  root: {
    "& > *": {
      marginRight: theme.spacing(1),
      width: 200,
      marginTop: theme.spacing(1)
    }
  },
  button: {
    height: "35px",
    marginTop: 20
  },
  boxHeight: {
    height: 10
  }
}));

export default function GroupRoles({ groupRoles, dispatch, error, edit, type, memberSubjectType }) {
  const classes = useStyles();
  React.useEffect(() => {
    httpClient.fetchJson("/web/operationalModules").then(response => {
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

  const filterOptions = option => {
    return (
      (Types.isHousehold(type) && includes(Types.householdMemberTypes, option.type)) ||
      (Types.getType("Group") === type && includes(Types.groupMemberTypes, option.type))
    );
  };

  return (
    <Box
      sx={{
        mt: 1
      }}
    >
      <Box
        sx={{
          mb: 2
        }}
      >
        {Types.isHousehold(type) && (
          <AvniSelect
            label="Select Member Subject *"
            value={memberSubjectType || ""}
            onChange={event => dispatch({ type: "householdMemberSubject", payload: event.target.value })}
            style={{ width: "200px", marginBottom: 5 }}
            required
            options={
              subjectTypeOptions &&
              subjectTypeOptions.filter(filterOptions).map(option => (
                <MenuItem key={option.uuid} value={option.name}>
                  {option.name}
                </MenuItem>
              ))
            }
            toolTipKey={"APP_DESIGNER_SUBJECT_MEMBER_SUBJECT_TYPE"}
          />
        )}
      </Box>
      {map(nonVoidedRoles, (groupRole, index) => (
        <Grid
          key={index}
          container
          direction="row"
          sx={{
            alignItems: "center"
          }}
        >
          <Box className={classes.root} noValidate autoComplete="off">
            <TextField
              disabled={Types.isHousehold(type)}
              id="role"
              label="Role Name"
              variant="outlined"
              value={groupRole.role || ""}
              InputProps={{ classes: { input: classes.boxHeight } }}
              onChange={event => onGroupRoleChange({ ...groupRole, role: event.target.value }, index)}
            />
            <TextField
              disabled={Types.isHousehold(type)}
              id="subject-member-name"
              select
              label="Select Member Subject"
              value={groupRole.subjectMemberName || ""}
              InputProps={{ classes: { input: classes.boxHeight } }}
              onChange={event =>
                onGroupRoleChange(
                  {
                    ...groupRole,
                    subjectMemberName: event.target.value
                  },
                  index
                )
              }
              variant="outlined"
            >
              {subjectTypeOptions &&
                subjectTypeOptions.filter(filterOptions).map(option => (
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
              InputProps={{ classes: { input: classes.boxHeight } }}
              onChange={event =>
                onGroupRoleChange(
                  {
                    ...groupRole,
                    minimumNumberOfMembers: +event.target.value.replace(/\D/g, "")
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
              InputProps={{ classes: { input: classes.boxHeight } }}
              onChange={event =>
                onGroupRoleChange(
                  {
                    ...groupRole,
                    maximumNumberOfMembers: +event.target.value.replace(/\D/g, "")
                  },
                  index
                )
              }
            />
          </Box>
          {!Types.isHousehold(type) && (
            <IconButton
              aria-label="delete"
              onClick={() => onDeleteGroupRole(index, groupRole, edit)}
              style={{ marginTop: 10 }}
              size="large"
            >
              <Delete fontSize="inherit" />
            </IconButton>
          )}
        </Grid>
      ))}
      {error && <FormHelperText error>Group fields can not be blank</FormHelperText>}
      {!Types.isHousehold(type) && (
        <Button type="button" className={classes.button} color="primary" onClick={onAddNewGroupRole}>
          Add Role
        </Button>
      )}
    </Box>
  );
}
