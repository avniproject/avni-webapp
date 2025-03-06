import React from "react";

import { makeStyles, withStyles } from "@material-ui/core/styles";
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
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import QueryBuilderIcon from "@material-ui/icons/QueryBuilder";
import TimerIcon from "@material-ui/icons/Timer";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import DateRangeIcon from "@material-ui/icons/DateRange";
import PhoneIcon from "@material-ui/icons/Phone";
import TextFieldsIcon from "@material-ui/icons/TextFields";
import NoteIcon from "@material-ui/icons/Note";
import Tooltip from "@material-ui/core/Tooltip";
import ImageIcon from "@material-ui/icons/Image";
import VideocamIcon from "@material-ui/icons/Videocam";
import PinDropIcon from "@material-ui/icons/PinDrop";
import FormElementTabs from "./FormElementTabs";
import { isEqual } from "lodash";
import { ToolTip } from "../../common/components/ToolTip";
import DragHandleIcon from "@material-ui/icons/DragHandle";
import Audiotrack from "@material-ui/icons/Audiotrack";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";

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
  },
  asterisk: {
    color: "red"
  }
}));
export const ExpansionPanel = withStyles({
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

export const ExpansionPanelDetails = withStyles({
  root: {
    backgroundColor: "#fff",
    border: "2px solid #bdc6cf",
    padding: 10
  }
})(MuiExpansionPanelDetails);

export const ExpansionPanelSummary = withStyles({
  root: {
    paddingRight: 0,
    paddingLeft: "10px",
    backgroundColor: "#dbdbdb",
    border: "2px solid #bdc6cf",
    minHeight: 56,
    "&$expanded": {
      minHeight: 56
    },
    "&$focused": {
      backgroundColor: "#dbdbdb"
    }
  },
  focused: {},
  content: {
    margin: "0px 0 0 0",
    "&$expanded": { margin: "0px 0 0 0" }
  },
  expanded: {}
})(MuiExpansionPanelSummary);
export const dataTypeIcons = {
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
  ImageV2: <ImageIcon />,
  DateTime: <DateRangeIcon />,
  Time: <QueryBuilderIcon />,
  Duration: <TimerIcon />,
  Video: <VideocamIcon />,
  Id: <b>Id</b>,
  Location: <PinDropIcon />,
  Subject: <b>ST</b>,
  Encounter: <b>ET</b>,
  PhoneNumber: <PhoneIcon />,
  GroupAffiliation: <b>GA</b>,
  QuestionGroup: <b>QG</b>,
  Audio: <Audiotrack />,
  File: <InsertDriveFileIcon />,
  "": <b />
};

function FormElement(props) {
  const classes = useStyles();
  const panel = "panel" + props.groupIndex.toString + props.index.toString();

  const [dragElement, setDragElement] = React.useState(false);
  const disableFormElement = props.disableFormElement;

  const DragHandler = props => (
    <div style={{ height: 5 }} {...props}>
      <div hidden={!dragElement || disableFormElement}>
        <DragHandleIcon color={"disabled"} />
      </div>
    </div>
  );

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
      onChange={event => props.handleGroupElementChange(props.groupIndex, "expanded", !props.formElementData.expanded, props.index)}
      onMouseEnter={() => setDragElement(true)}
      onMouseLeave={() => setDragElement(false)}
    >
      <ExpansionPanelSummary aria-controls={panel + "bh-content"} id={panel + "bh-header"} {...props.dragHandleProps}>
        <Grid container direction={"row"}>
          <Grid container item alignItems={"center"} justify={"center"}>
            <DragHandler />
          </Grid>
          <Grid container item sm={12} alignItems={"center"}>
            <Grid item>
              <Typography component={"div"} className={classes.secondaryHeading}>
                {[
                  "Date",
                  "Numeric",
                  "Text",
                  "Notes",
                  "Image",
                  "ImageV2",
                  "DateTime",
                  "Time",
                  "Duration",
                  "Video",
                  "Id",
                  "Location",
                  "Subject",
                  "PhoneNumber",
                  "GroupAffiliation",
                  "Audio",
                  "File",
                  "QuestionGroup",
                  "Encounter"
                ].includes(props.formElementData.concept.dataType) && (
                  <div className={classes.iconDataType}>
                    <Tooltip title={props.formElementData.concept.dataType}>
                      {dataTypeIcons[props.formElementData.concept.dataType]}
                    </Tooltip>
                  </div>
                )}
                {props.formElementData.concept.dataType === "Coded" && (
                  <div className={classes.iconDataType}>
                    <Tooltip title={props.formElementData.concept.dataType + " : " + props.formElementData.type}>
                      {dataTypeIcons["concept"][props.formElementData.type]}
                    </Tooltip>
                  </div>
                )}
              </Typography>
            </Grid>
            <Grid item sm={10} style={{ paddingTop: "10px" }}>
              <Typography component={"span"} className={classes.heading}>
                <span className={classes.expandIcon}>{props.formElementData.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</span>
                <InputLabel
                  name={"name" + panel}
                  style={{ display: "inline-block" }}
                  required={props.formElementData.mandatory}
                  classes={{ asterisk: classes.asterisk }}
                  disabled={disableFormElement}
                >
                  {props.formElementData.name}
                </InputLabel>
              </Typography>
            </Grid>
            <Grid item sm={1} direction={"row"}>
              <IconButton aria-label="delete" onClick={handleDelete} disabled={disableFormElement}>
                <DeleteIcon />
              </IconButton>
              <ToolTip toolTipKey={"APP_DESIGNER_FORM_ELEMENT_NAME"} onHover displayPosition={"bottom"} />
            </Grid>
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
