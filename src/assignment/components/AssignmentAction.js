import React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Modal from "@material-ui/core/Modal";
import { makeStyles, Typography } from "@material-ui/core";
import Select from "react-select";

const useStyles = makeStyles(theme => ({
  paper: {
    position: "absolute",
    width: 800,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  }
}));

export const AssignmentAction = ({
  openAction,
  onDone,
  dispatch,
  userOptions,
  assignmentCriteria,
  taskStatusOptions
}) => {
  const classes = useStyles();
  const onClose = () => dispatch({ type: "hideAction" });
  const onActionChange = (key, value) => dispatch({ type: "setAction", payload: { key, value } });
  const assignedToKeyName = assignmentCriteria.allSelected ? "assignToUserIds" : "assignToUserId";

  const selectAction = (label, value, options, assignmentKeyName, isMulti = false) => (
    <Grid item spacing={3} alignItems={"center"} xs={12}>
      <Typography variant="body1">{label}</Typography>
      <Select
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

  return (
    <Modal disableBackdropClick open={openAction} onClose={onClose}>
      <Grid
        container
        direction={"column"}
        spacing={3}
        className={classes.paper}
        style={{ top: "25%", left: "30%" }}
      >
        <Typography variant={"h6"}>{"Bulk Action"}</Typography>
        {selectAction(
          "Set user to",
          null,
          userOptions,
          assignedToKeyName,
          assignmentCriteria.allSelected
        )}
        {selectAction("Set status to", null, taskStatusOptions, "statusId")}
        <Grid item container spacing={3}>
          <Grid item>
            <Button variant="contained" color="primary" onClick={onClose}>
              {"Cancel"}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={onDone}>
              {"Done"}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Modal>
  );
};
