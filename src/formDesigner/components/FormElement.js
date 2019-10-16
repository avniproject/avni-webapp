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
import { InputLabel } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import QueryBuilderIcon from "@material-ui/icons/QueryBuilder";
import TimerIcon from "@material-ui/icons/Timer";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import DateRangeIcon from "@material-ui/icons/DateRange";
import TextFieldsIcon from "@material-ui/icons/TextFields";
import NoteIcon from "@material-ui/icons/Note";
import Tooltip from "@material-ui/core/Tooltip";
import ImageIcon from "@material-ui/icons/Image";
import VideocamIcon from "@material-ui/icons/Videocam";

import Mandatory from "@material-ui/icons/CheckCircleOutline";
import NonMandatory from "@material-ui/icons/HighlightOff";
import FormElementTabs from "./FormElementTabs";
import { isEqual } from "lodash";

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%"
  },
  rootError: {
    width: "100%",
    border: "1px solid red"
  },
  iconlay: {
    paddingTop: "3px"
  },
  expandIcon: {
    paddingTop: "3px",
    paddingRight: "0px"
  },
  iconDataType: {
    padding: "10px"
    // backgroundColor: "#efefef"
  },
  questionCount: {
    paddingTop: "20px"
  },
  deleteicon: {
    padding: "10px 30px -1px 0px"
    // marginTop: "-10px"
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
    paddingTop: "10px"
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
  },
  requiredIcon: {
    textAlign: "center"
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
    paddingLeft: "10px",
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
    margin: "0px 0 0 0",
    "&$expanded": { margin: "0px 0 0 0" }
  },
  expanded: {}
})(MuiExpansionPanelSummary);
const dataTypeIcons = {
  concept: {
    SingleSelect: <RadioButtonCheckedIcon />,
    MultiSelect: <CheckCircleOutlineIcon />,
    "": <b />
  },
  Date: <CalendarTodayIcon />,
  Numeric: <b>123</b>,
  Text: <TextFieldsIcon />,
  Notes: <NoteIcon />,
  Image: <ImageIcon />,
  DateTime: <DateRangeIcon />,
  Time: <QueryBuilderIcon />,
  Duration: <TimerIcon />,
  Video: <VideocamIcon />,
  Id: <b>Id</b>,
  "": <b />
};

function FormElement(props) {
  const classes = useStyles();
  const panel = "panel" + props.groupIndex.toString + props.index.toString();

  const handleDelete = event => {
    props.deleteGroup(props.groupIndex, props.index);
    event.stopPropagation();
    //props.deleteRecord(props.index);
  };

  return (
    <ExpansionPanel
      TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
      expanded={props.formElementData.expanded}
      className={props.formElementData.error ? classes.rootError : classes.root}
      onChange={event =>
        props.handleGroupElementChange(
          props.groupIndex,
          "expanded",
          !props.formElementData.expanded,
          props.index
        )
      }
    >
      <ExpansionPanelSummary aria-controls={panel + "bh-content"} id={panel + "bh-header"}>
        <div className={classes.iconlay}>
          <Typography component={"div"} className={classes.secondaryHeading}>
            {[
              "Date",
              "Numeric",
              "Text",
              "Notes",
              "Image",
              "DateTime",
              "Time",
              "Duration",
              "Video",
              "Id"
            ].includes(props.formElementData.concept.dataType) && (
              <div className={classes.iconDataType}>
                <Tooltip title={props.formElementData.concept.dataType}>
                  {dataTypeIcons[props.formElementData.concept.dataType]}
                </Tooltip>
              </div>
            )}
            {props.formElementData.concept.dataType === "Coded" && (
              <div className={classes.iconDataType}>
                <Tooltip
                  title={
                    props.formElementData.concept.dataType + " : " + props.formElementData.type
                  }
                >
                  {dataTypeIcons["concept"][props.formElementData.type]}
                </Tooltip>
              </div>
            )}
          </Typography>
        </div>
        <Grid container item sm={12}>
          <Grid item sm={10} style={{ paddingTop: "10px" }}>
            <Typography component={"span"} className={classes.heading}>
              <span className={classes.expandIcon}>
                {props.formElementData.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </span>
              <InputLabel name={"name" + panel} style={{ width: "80%", display: "inline-block" }}>
                {props.formElementData.name}
              </InputLabel>
            </Typography>
          </Grid>

          <Grid item sm={2} className={classes.requiredIcon}>
            {/* <div className={classes.requiredIcon}> */}
            {props.formElementData.mandatory ? (
              <Tooltip title="Required">
                <Mandatory className={classes.iconMandatory} />
              </Tooltip>
            ) : (
              <Tooltip title="Not required">
                <NonMandatory className={classes.iconNonMandatory} />
              </Tooltip>
            )}
            {/* </span>
              <span className={classes.deleteicon}> */}
            <IconButton aria-label="delete" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
            {/* </div> */}
          </Grid>
        </Grid>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <FormElementTabs {...props} indexTab={props.groupIndex + "" + props.index} />
      </ExpansionPanelDetails>
      {false && <Divider /> && <ExpansionPanelActions />}
    </ExpansionPanel>
  );
}

export default React.memo(FormElement, areEqual);
