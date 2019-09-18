import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import MuiExpansionPanelActions from "@material-ui/core/ExpansionPanelActions";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import Grid from "@material-ui/core/Grid";
import { FormControl, Input, InputLabel } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import Mandatory from "@material-ui/icons/CheckCircleOutline";
import NonMandatory from "@material-ui/icons/HighlightOff";
import FormElementTabs from "./FormElementTabs";

const useStyles = makeStyles(theme => ({
  parent: {
    paddingLeft: 20,
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
  },
  iconMandatory: {
    color: "Green"
  },
  iconNonMandatory: {
    color: "Red"
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

const ExpansionPanelActions = withStyles({
  root: {}
})(MuiExpansionPanelActions);

const ExpansionPanelDetails = withStyles({
  root: {
    backgroundColor: "#fff",
    border: "2px solid #bdc6cf",
    padding: 10
  }
})(MuiExpansionPanelDetails);

const ExpansionPanelSummary = withStyles({
  root: {
    paddingRight: 0,
    backgroundColor: "#fff",
    border: "2px solid #bdc6cf",
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

export default function FormElement(props) {
  const classes = useStyles();
  const [hover, setHover] = React.useState(false);
  const panel = "panel" + props.groupIndex.toString + props.index.toString();

  const handleDelete = event => {
    props.deleteElement(props.groupIndex, props.index);
    event.stopPropagation();
    //props.deleteRecord(props.index);
  };

  const separateAddElement = event => {
    props.btnElementAdd(props.groupIndex, props.index);
  };
  const stopPropagation = e => e.stopPropagation();

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
      <ExpansionPanel
        expanded={props.formElementData.collapse}
        className={props.formElementData.error ? classes.rootError : classes.root}
        onChange={event =>
          props.updateGroupData(
            props.groupIndex,
            "collapse",
            !props.formElementData.collapse,
            props.index
          )
        }
      >
        <ExpansionPanelSummary aria-controls={panel + "bh-content"} id={panel + "bh-header"}>
          <div className={classes.iconlay}>
            {props.formElementData.collapse === true ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </div>
          <Grid container item sm={12}>
            <Grid item sm={4}>
              <Typography component={"span"} className={classes.heading}>
                <FormControl fullWidth>
                  <InputLabel htmlFor={"name" + panel}>Name</InputLabel>
                  <Input
                    type="text"
                    disableUnderline={true}
                    name={"name" + panel}
                    value={props.formElementData.name}
                    onClick={stopPropagation}
                    onChange={event =>
                      props.updateElementData(
                        props.groupIndex,
                        "name",
                        event.target.value,
                        props.index
                      )
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
                  {props.formElementData.concept.dataType !== "" && "Type"}
                  <br />
                  {props.formElementData.concept.dataType}{" "}
                  {props.formElementData.concept.dataType === "Coded" &&
                    props.formElementData.type !== "" &&
                    ": " + props.formElementData.type}
                </FormControl>
              </Typography>
            </Grid>
            <Grid item sm={1}>
              &nbsp;
            </Grid>
            <Grid item sm={2}>
              <Typography component={"span"} className={classes.secondaryHeading}>
                <FormControl fullWidth>
                  Mandatory <br />
                  {props.formElementData.mandatory ? (
                    <Mandatory className={classes.iconMandatory} />
                  ) : (
                    <NonMandatory className={classes.iconNonMandatory} />
                  )}
                </FormControl>
              </Typography>
            </Grid>
          </Grid>
          <IconButton className={classes.deleteicon} aria-label="delete" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <FormElementTabs {...props} indexTab={props.groupIndex + "" + props.index} />
        </ExpansionPanelDetails>
        {false && <Divider /> && <ExpansionPanelActions />}
      </ExpansionPanel>
      <div className={classes.absolute}>
        {hover && (
          <Fab color="secondary" aria-label="add" onClick={separateAddElement} size="small">
            <AddIcon />
          </Fab>
        )}
      </div>
    </div>
  );
}
