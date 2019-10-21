import React from "react";

// import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import { isEqual } from "lodash";

import FormElement from "./FormElement";
import { withStyles } from "@material-ui/core/styles";

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

const styles = theme => ({
  parent: {
    paddingLeft: 20,
    paddingBottom: 30
  },

  absolute: {
    position: "absolute",
    marginLeft: -35,
    marginTop: -5
  }
});

function FormElementWithAddButton(props) {
  const { classes } = props;
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
          <Button
            variant="fab"
            color="secondary"
            aria-label="add"
            onClick={event => props.btnGroupAdd(props.groupIndex, props.index)}
            mini
          >
            <AddIcon />
          </Button>
        )}
      </div>
    </div>
  );
}

export default React.memo(withStyles(styles)(FormElementWithAddButton), areEqual);
