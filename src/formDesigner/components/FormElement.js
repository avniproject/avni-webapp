import React from "react";
import { withStyles, makeStyles } from "@mui/styles";
import { Accordion, AccordionDetails, AccordionSummary, Typography, Grid, InputLabel, IconButton, Tooltip } from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  Delete,
  RadioButtonChecked,
  CheckCircleOutline,
  QueryBuilder,
  Timer,
  CalendarToday,
  DateRange,
  Phone,
  TextFields,
  Note,
  Image,
  Videocam,
  PinDrop,
  DragHandle,
  Audiotrack,
  InsertDriveFile
} from "@mui/icons-material";
import FormElementTabs from "./FormElementTabs";
import { isEqual } from "lodash";
import { ToolTip } from "../../common/components/ToolTip";

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
  },
  questionCount: {
    paddingTop: "20px"
  },
  deleteicon: {
    padding: "10px 30px -1px 0px"
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

const StyledAccordion = withStyles({
  root: {
    "&$expanded": {
      margin: 0
    }
  },
  expanded: {}
})(Accordion);

const StyledAccordionDetails = withStyles({
  root: {
    backgroundColor: "#fff",
    border: "2px solid #bdc6cf",
    padding: 10
  }
})(AccordionDetails);

const StyledAccordionSummary = withStyles({
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
})(AccordionSummary);

export const dataTypeIcons = {
  concept: {
    SingleSelect: <RadioButtonChecked />,
    MultiSelect: <CheckCircleOutline />,
    "": <b />
  },
  Date: <CalendarToday />,
  Numeric: <b>123</b>,
  Text: <TextFields />,
  Notes: <Note />,
  Image: <Image />,
  ImageV2: <Image />,
  DateTime: <DateRange />,
  Time: <QueryBuilder />,
  Duration: <Timer />,
  Video: <Videocam />,
  Id: <b>Id</b>,
  Location: <PinDrop />,
  Subject: <b>ST</b>,
  Encounter: <b>ET</b>,
  PhoneNumber: <Phone />,
  GroupAffiliation: <b>GA</b>,
  QuestionGroup: <b>QG</b>,
  Audio: <Audiotrack />,
  File: <InsertDriveFile />,
  "": <b />
};

function FormElement(props) {
  const classes = useStyles();
  const panel = "panel" + props.groupIndex.toString() + props.index.toString();
  const [dragElement, setDragElement] = React.useState(false);
  const disableFormElement = props.disableFormElement;

  const DragHandler = props => (
    <div style={{ height: 5 }} {...props}>
      <div hidden={!dragElement || disableFormElement}>
        <DragHandle color="disabled" />
      </div>
    </div>
  );

  const handleDelete = event => {
    props.deleteGroup(props.groupIndex, props.index);
    event.stopPropagation();
  };

  return (
    <StyledAccordion
      TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
      expanded={props.formElementData.expanded}
      className={props.formElementData.error ? classes.rootError : classes.root}
      onChange={event => props.handleGroupElementChange(props.groupIndex, "expanded", !props.formElementData.expanded, props.index)}
      onMouseEnter={() => setDragElement(true)}
      onMouseLeave={() => setDragElement(false)}
    >
      <StyledAccordionSummary aria-controls={panel + "bh-content"} id={panel + "bh-header"} {...props.dragHandleProps}>
        <Grid container direction="row">
          <Grid
            container
            sx={{
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <DragHandler />
          </Grid>
          <Grid
            container
            sx={{
              alignItems: "center"
            }}
            size={{
              sm: 12
            }}
          >
            <Grid>
              <Typography component="div" className={classes.secondaryHeading}>
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
            <Grid
              style={{ paddingTop: "10px" }}
              size={{
                sm: 10
              }}
            >
              <Typography component="span" className={classes.heading}>
                <span className={classes.expandIcon}>{props.formElementData.expanded ? <ExpandLess /> : <ExpandMore />}</span>
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
            <Grid
              size={{
                sm: 1
              }}
            >
              <IconButton aria-label="delete" onClick={handleDelete} disabled={disableFormElement} size="small">
                <Delete />
              </IconButton>
              <ToolTip title="APP_DESIGNER_FORM_ELEMENT_NAME" />
            </Grid>
          </Grid>
        </Grid>
      </StyledAccordionSummary>
      <StyledAccordionDetails>
        <FormElementTabs {...props} indexTab={props.groupIndex + "" + props.index} />
      </StyledAccordionDetails>
    </StyledAccordion>
  );
}
export default React.memo(FormElement, areEqual);
