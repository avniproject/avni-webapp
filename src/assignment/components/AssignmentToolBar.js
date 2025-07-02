import React, { useEffect } from "react";
import { styled } from '@mui/material/styles';
import { isEmpty, map, size, uniq } from "lodash";
import { Typography, Button } from "@mui/material";

const StyledRoot = styled('div')(({ theme }) => ({
  margin: "10px",
  paddingTop: "10px",
  display: "flex",
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "flex-end"
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(10),
  marginRight: theme.spacing(10)
}));

const StyledSelectButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(10),
  marginRight: theme.spacing(10)
}));

export const AssignmentToolBar = ({ assignmentCriteria, dispatch, showSelect1000 = true, ...props }) => {
  const { data, selectedRows } = props;
  const selectedRowSize = size(selectedRows);

  useEffect(() => {
    if (size(props.selectedRows) === 0 && assignmentCriteria.allSelected) {
      dispatch({ type: "setAction", payload: { key: "allSelected", value: false } });
    }
  }, [props]);

  const selectedIds = map(selectedRows, "id");
  const selectedTaskTypeNames = uniq(map(selectedRows, "type"));

  const onActionPress = selectedIds => {
    dispatch({
      type: "displayAction",
      payload: { display: true, selectedIds, selectedTaskTypeNames }
    });
  };

  const on1000Selected = () => dispatch({ type: "setAction", payload: { key: "allSelected", value: true } });

  return (
    <StyledRoot>
      {selectedRowSize > 0 && (
        <StyledTypography variant="body1">
          {`Selected ${assignmentCriteria.allSelected ? 1000 : selectedRowSize} tasks`}
        </StyledTypography>
      )}
      {showSelect1000 && selectedRowSize > 0 && selectedRowSize === size(data) && (
        <StyledSelectButton color="primary" onClick={on1000Selected}>
          {"Click here to select first 1000 tasks"}
        </StyledSelectButton>
      )}
      <Button variant="contained" color="primary" onClick={() => onActionPress(selectedIds)} disabled={isEmpty(selectedIds)}>
        {"Actions"}
      </Button>
    </StyledRoot>
  );
};