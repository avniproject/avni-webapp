import React from "react";
import { makeStyles } from "@mui/styles";
import { Grid, Button, Modal, Typography } from "@mui/material";
import Select from "react-select";
import MuiComponentHelper from "../../common/utils/MuiComponentHelper";

const useStyles = makeStyles(theme => ({
  paper: {
    position: "absolute",
    width: 800,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  }
}));

const SelectAction = function({ dispatch, label, options, assignmentKeyName, isMulti, assignmentCriteria }) {
  const onActionChange = (key, value) => dispatch({ type: "setAction", payload: { key, value } });

  return (
    <Grid
      spacing={3}
      sx={{
        alignItems: "center"
      }}
      size={12}
    >
      <Typography variant="body1">{label}</Typography>
      <Select
        isDisabled={options.length === 0}
        isClearable
        isSearchable
        isMulti={isMulti}
        value={assignmentCriteria[assignmentKeyName]}
        options={options}
        style={{ width: "auto" }}
        onChange={event => onActionChange(assignmentKeyName, event)}
      />
    </Grid>
  );
};
export const TaskAssignmentAction = ({
  openAction,
  onDone,
  dispatch,
  userOptions,
  assignmentCriteria,
  taskStatusOptions,
  isAssignMultiUsers = true,
  userAssignmentKeyName = "assignToUserIds",
  statusAssignmentKeyName = "statusId"
}) => {
  const classes = useStyles();
  const onClose = () => dispatch({ type: "hideAction" });
  return (
    <Modal onClose={MuiComponentHelper.getDialogClosingHandler(onClose)} open={openAction}>
      <Grid container direction={"column"} spacing={3} className={classes.paper} style={{ top: "25%", left: "30%" }}>
        <Typography variant={"h6"}>{"Bulk Action"}</Typography>
        <SelectAction
          dispatch={dispatch}
          label="Set user to"
          assignmentKeyName={userAssignmentKeyName}
          isMulti={isAssignMultiUsers}
          options={userOptions}
          assignmentCriteria={assignmentCriteria}
        />
        <SelectAction
          options={taskStatusOptions}
          isMulti={false}
          dispatch={dispatch}
          label="Set status to"
          assignmentKeyName={statusAssignmentKeyName}
          assignmentCriteria={assignmentCriteria}
        />
        <Grid container spacing={3}>
          <Grid>
            <Button variant="outlined" color="secondary" onClick={onClose}>
              {"Cancel"}
            </Button>
          </Grid>
          <Grid>
            <Button variant="contained" color="primary" onClick={onDone}>
              {"Done"}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Modal>
  );
};
