import React from "react";

import _ from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import Grid from "@material-ui/core/Grid";
import { FormControl, Input, InputLabel } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";

import FormElement from "./FormElement";

const useStyles = makeStyles(theme => ({
  parent: {
    paddingLeft: 0,
    paddingBottom: 30
  },
  root: {
    width: "100%"
  },
  rootError: {
    width: "100%",
    border: "1px solid red"
  },
  iconlay: {
    padding: "20px 20px 20px 0px"
  },
  questionCount: {
    paddingTop: "20px"
  },
  deleteicon: {
    padding: "20px 30px 20px 30px",
    marginTop: "-10px"
  },
  absolute: {
    position: "absolute",
    marginLeft: -35,
    marginTop: -5
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0
  },
  secondaryHeading: {
    flexBasis: "70%",
    fontSize: theme.typography.pxToRem(15)
    //color: theme.palette.text.secondary,
  }
}));
const ExpansionPanel = withStyles({
  root: {
    "&$expanded": {
      margin: 0
    }
  },
  expanded: {}
})(MuiExpansionPanel);

const ExpansionPanelDetails = withStyles({
  root: {
    width: "100%",
    border: "1px solid #2196F3"
  }
})(MuiExpansionPanelDetails);

const ExpansionPanelSummary = withStyles({
  root: {
    paddingRight: 0,
    backgroundColor: "#fff",
    border: "1px solid #2196F3",
    minHeight: 56,
    "&$expanded": {
      minHeight: 56
    },
    "&$focused": {
      backgroundColor: "#fff"
    }
  },
  focused: {},
  content: {
    margin: "10px 0 0 0",
    "&$expanded": { margin: "10px 0 0 0" }
  },
  expanded: {}
})(MuiExpansionPanelSummary);

export default function FormElementGroup(props) {
  const classes = useStyles();
  const [hover, setHover] = React.useState(false);
  const panel = "panel" + props.index.toString();
  let questionCount = 0;

  _.forEach(props.groupData.formElements, (element, index) => {
    if (element.voided === false) {
      questionCount = questionCount + 1;
    }
  });

  const handleDelete = event => {
    props.deleteGroup(props.index);
    event.stopPropagation();
    //props.deleteRecord(props.index);
  };

  const separateAddGroup = event => {
    props.btnGroupAdd(props.index);
  };

  const separateAddElement = event => {
    props.btnGroupAdd(props.index, 0);
  };
  const stopPropagation = e => e.stopPropagation();

  //Display/Hide Add Group button
  const hoverDisplayAddGroup = event => {
    setHover(true);
  };

  const hoverHideAddGroup = event => {
    setHover(false);
  };

  const renderFormElements = () => {
    const formElements = [];
    _.forEach(props.groupData.formElements, (formElement, index) => {
      if (formElement.voided === false) {
        let propsElement = {
          key: index,
          formElementData: formElement,
          groupIndex: props.index,
          index: index,
          btnElementAdd: props.btnGroupAdd,
          updateElementData: props.updateGroupData,
          deleteElement: props.deleteGroup
        };

        formElements.push(<FormElement {...props} {...propsElement} />);
      }
    });
    return formElements;
  };

  return (
    <div
      className={classes.parent}
      onMouseEnter={hoverDisplayAddGroup}
      onMouseLeave={hoverHideAddGroup}
    >
      <ExpansionPanel
        expanded={props.groupData.collapse}
        className={props.groupData.error ? classes.rootError : classes.root}
        onChange={event =>
          props.updateGroupData(props.index, "collapse", !props.groupData.collapse)
        }
      >
        <ExpansionPanelSummary aria-controls={panel + "bh-content"} id={panel + "bh-header"}>
          <div className={classes.iconlay}>
            {props.groupData.collapse === true ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </div>
          <Grid container item sm={12}>
            <Grid item sm={4}>
              <Typography component={"span"} className={classes.heading}>
                <FormControl fullWidth>
                  <InputLabel htmlFor={"name" + panel}>Name</InputLabel>
                  <Input
                    type="text"
                    disableUnderline={true}
                    onClick={stopPropagation}
                    name={"name" + panel}
                    value={props.groupData.name}
                    onChange={event =>
                      props.updateGroupData(props.index, "name", event.target.value)
                    }
                  />
                </FormControl>
              </Typography>
            </Grid>
            <Grid item sm={1}>
              &nbsp;
            </Grid>
            <Grid item sm={4}>
              <Typography component={"span"} className={classes.secondaryHeading}>
                <FormControl fullWidth>
                  <InputLabel htmlFor={"display" + panel}>Display Name</InputLabel>
                  <Input
                    type="text"
                    disableUnderline={true}
                    name={"display" + panel}
                    value={props.groupData.display}
                    onClick={stopPropagation}
                    onChange={event =>
                      props.updateGroupData(props.index, "display", event.target.value)
                    }
                  />
                </FormControl>
              </Typography>
            </Grid>
            <Grid item sm={3}>
              <Typography component={"div"} className={classes.questionCount}>
                No. of questions : {questionCount}
              </Typography>
            </Grid>
          </Grid>
          <IconButton className={classes.deleteicon} aria-label="delete" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography component={"span"} className={classes.root}>
            {renderFormElements()}

            {questionCount === 0 && (
              <FormControl fullWidth>
                <Button variant="contained" color="secondary" onClick={separateAddElement}>
                  Add Question
                </Button>
              </FormControl>
            )}
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
      {hover && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={separateAddGroup}
          className={classes.absolute}
          size="small"
        >
          <AddIcon />
        </Fab>
      )}
    </div>
  );
}
