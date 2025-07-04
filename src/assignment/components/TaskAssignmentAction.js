import { styled } from "@mui/material/styles";
import { Grid, Button, Modal, Typography } from "@mui/material";
import Select from "react-select";
import MuiComponentHelper from "../../common/utils/MuiComponentHelper";

const StyledModalContent = styled(Grid)(({ theme }) => ({
  position: "absolute",
  width: 800,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  top: "25%",
  left: "30%"
}));

const StyledSelectGrid = styled(Grid)({
  alignItems: "center"
});

const StyledSelect = styled(Select)({
  width: "auto"
});

const SelectAction = ({ dispatch, label, options, assignmentKeyName, isMulti, assignmentCriteria }) => {
  const onActionChange = (key, value) => dispatch({ type: "setAction", payload: { key, value } });

  return (
    <StyledSelectGrid spacing={3} size={12}>
      <Typography variant="body1">{label}</Typography>
      <StyledSelect
        isDisabled={options.length === 0}
        isClearable
        isSearchable
        isMulti={isMulti}
        value={assignmentCriteria[assignmentKeyName]}
        options={options}
        onChange={event => onActionChange(assignmentKeyName, event)}
      />
    </StyledSelectGrid>
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
  const onClose = () => dispatch({ type: "hideAction" });

  return (
    <Modal onClose={MuiComponentHelper.getDialogClosingHandler(onClose)} open={openAction}>
      <StyledModalContent container direction="column" spacing={3}>
        <Typography variant="h6">{"Bulk Action"}</Typography>
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
      </StyledModalContent>
    </Modal>
  );
};
