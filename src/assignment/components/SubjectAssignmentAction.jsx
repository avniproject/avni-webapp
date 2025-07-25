import { styled } from "@mui/material/styles";
import { Grid, Button, Modal, Typography, RadioGroup } from "@mui/material";
import Select from "react-select";

const StyledModalContent = styled(Grid)(({ theme }) => ({
  position: "absolute",
  width: "40%",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  top: "25%",
  left: "30%"
}));

const SelectAction = function({
  dispatch,
  label,
  options,
  assignmentKeyName,
  isMulti,
  assignmentCriteria
}) {
  const onActionChange = (key, value) =>
    dispatch({ type: "setAction", payload: { key, value } });

  return (
    <Grid size={12}>
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

export const SubjectAssignmentAction = ({
  openAction,
  onDone,
  dispatch,
  userOptions,
  assignmentCriteria,
  actionOptions,
  isAssignMultiUsers = true,
  userAssignmentKeyName = "assignToUserIds",
  actionAssignmentKeyName = "actionId"
}) => {
  const onClose = () => dispatch({ type: "hideAction" });

  const checkValues = () => {
    return !assignmentCriteria[userAssignmentKeyName];
  };

  return (
    <Modal
      open={openAction}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          onClose(event, reason);
        }
      }}
    >
      <StyledModalContent container direction="column" spacing={3}>
        <Typography variant="h6">Bulk action</Typography>
        <Grid container spacing={3}>
          <Grid>
            <RadioGroup
              aria-label="Bulk Action for user"
              name={actionAssignmentKeyName}
              value={assignmentCriteria[actionAssignmentKeyName]}
              onChange={(event, value) =>
                dispatch({
                  type: "setAction",
                  payload: {
                    key: actionAssignmentKeyName,
                    value: parseInt(value)
                  }
                })
              }
              row
            >
              {actionOptions}
            </RadioGroup>
          </Grid>
        </Grid>
        <SelectAction
          dispatch={dispatch}
          label="User"
          assignmentKeyName={userAssignmentKeyName}
          isMulti={isAssignMultiUsers}
          options={userOptions}
          assignmentCriteria={assignmentCriteria}
        />
        <Grid container spacing={3}>
          <Grid>
            <Button variant="outlined" color="secondary" onClick={onClose}>
              Cancel
            </Button>
          </Grid>
          <Grid>
            <Button
              variant="contained"
              color="primary"
              onClick={onDone}
              disabled={checkValues()}
            >
              Done
            </Button>
          </Grid>
        </Grid>
      </StyledModalContent>
    </Modal>
  );
};
