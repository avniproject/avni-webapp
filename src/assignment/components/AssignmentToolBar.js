import React, { useEffect } from "react";
import { isEmpty, map, size, uniq } from "lodash";
import { makeStyles, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";

const useStyle = makeStyles(theme => ({
  root: {
    margin: "10px",
    paddingTop: "10px",
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  space: {
    marginLeft: theme.spacing(10),
    marginRight: theme.spacing(10),
    float: "left"
  }
}));

export const AssignmentToolBar = ({
  assignmentCriteria,
  dispatch,
  showSelect1000 = true,
  ...props
}) => {
  const classes = useStyle();
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

  const on1000Selected = () =>
    dispatch({ type: "setAction", payload: { key: "allSelected", value: true } });

  return (
    <div className={classes.root}>
      {selectedRowSize > 0 && (
        <Typography className={classes.space} variant="body1">
          {`Selected ${assignmentCriteria.allSelected ? 1000 : selectedRowSize} tasks`}
        </Typography>
      )}
      {showSelect1000 && selectedRowSize > 0 && selectedRowSize === size(data) && (
        <Button className={classes.space} color="primary" onClick={on1000Selected}>
          {"Click here to select first 1000 tasks"}
        </Button>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={() => onActionPress(selectedIds)}
        disabled={isEmpty(selectedIds)}
      >
        {"Actions"}
      </Button>
    </div>
  );
};
