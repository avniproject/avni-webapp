import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import _, { map } from "lodash";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import FormHelperText from "@material-ui/core/FormHelperText";
import MenuItem from "@material-ui/core/MenuItem";
import httpClient from "../../common/utils/httpClient";
import { default as UUID } from "uuid";

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
    width: "10%",
    marginTop: 20
  },
  boxHeight: {
    height: 10
  }
}));

export default function GroupRoles({ groupRoles, household, dispatch, error, edit }) {
  const classes = useStyles();
  React.useEffect(() => {
    httpClient.fetchJson("/web/operationalModules").then(response => {
      const json = response.json;
      json && setSubjectTypes(json.subjectTypes);
    });
  }, []);

  const [subjectTypeOptions, setSubjectTypes] = React.useState();
  const nonVoidedRoles = _.filter(groupRoles, ({ voided }) => !voided);

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

  return (
    <Box mt={2}>
      {map(nonVoidedRoles, (groupRole, index) => (
        <Grid key={index} container direction="row" alignItems="center">
          <Box className={classes.root} noValidate autoComplete="off">
            <TextField
              disabled={household}
              id="role"
              label="Role Name"
              variant="outlined"
              value={groupRole.role || ""}
              InputProps={{ classes: { input: classes.boxHeight } }}
              onChange={event =>
                onGroupRoleChange({ ...groupRole, role: event.target.value }, index)
              }
            />
            <TextField
              disabled={household}
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
                subjectTypeOptions.map(option => (
                  <MenuItem key={option.uuid} value={option.name}>
                    {option.name}
                  </MenuItem>
                ))}
            </TextField>
            <TextField
              disabled={household}
              id="minimum-number-of-members"
              label="Minimum members"
              variant="outlined"
              value={groupRole.minimumNumberOfMembers || ""}
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
              disabled={household}
              id="maximum-number-of-members"
              label="Maximum members"
              variant="outlined"
              value={groupRole.maximumNumberOfMembers || ""}
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
          {!household && (
            <IconButton
              aria-label="delete"
              onClick={() => onDeleteGroupRole(index, groupRole, edit)}
              style={{ marginTop: 10 }}
            >
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          )}
        </Grid>
      ))}
      {error && <FormHelperText error>Group fields can not be blank</FormHelperText>}
      {!household && (
        <Button
          type="button"
          className={classes.button}
          color="primary"
          onClick={onAddNewGroupRole}
        >
          Add Role
        </Button>
      )}
    </Box>
  );
}
