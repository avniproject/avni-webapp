import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import { isEqual } from "lodash";

import FormElement from "./FormElement";

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

const useStyles = makeStyles(() => ({
  parent: {
    paddingLeft: 20,
    paddingBottom: 30
  },

  absolute: {
    position: "absolute",
    marginLeft: -35,
    marginTop: -5
  }
}));

function FormElementWithAddButton(props) {
  const classes = useStyles();
  const [hover, setHover] = React.useState(false);

  const hoverDisplayAddGroup = event => {
    setHover(true);
  };

  const hoverHideAddGroup = event => {
    setHover(false);
  };

  return (
    <div
      className={classes.parent}
      onMouseEnter={hoverDisplayAddGroup}
      onMouseLeave={hoverHideAddGroup}
    >
      <FormElement {...props} />
      <div className={classes.absolute}>
        {hover && (
          <Fab
            color="secondary"
            aria-label="add"
            onClick={event => props.btnGroupAdd(props.groupIndex, props.index)}
            size="small"
          >
            <AddIcon />
          </Fab>
        )}
      </div>
    </div>
  );
}

export default React.memo(FormElementWithAddButton, areEqual);
