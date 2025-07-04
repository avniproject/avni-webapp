import { useState, memo } from "react";
import { styled } from "@mui/material/styles";
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

const StyledAccordion = styled(Accordion)(({ error }) => ({
  width: "100%",
  ...(error && {
    border: "1px solid red"
  }),
  "&.Mui-expanded": {
    margin: 0
  }
}));

const StyledAccordionSummary = styled(AccordionSummary)({
  paddingRight: 0,
  paddingLeft: "10px",
  backgroundColor: "#dbdbdb",
  border: "2px solid #bdc6cf",
  minHeight: 56,
  "&.Mui-expanded": {
    minHeight: 56
  },
  "&.Mui-focused": {
    backgroundColor: "#dbdbdb"
  },
  "& .MuiAccordionSummary-content": {
    margin: "0px 0 0 0",
    "&.Mui-expanded": {
      margin: "0px 0 0 0"
    }
  }
});

const StyledAccordionDetails = styled(AccordionDetails)({
  backgroundColor: "#fff",
  border: "2px solid #bdc6cf",
  padding: 10
});

const StyledDragHandler = styled("div")({
  height: 5
});

const StyledIconContainer = styled("div")({
  padding: "10px"
});

const StyledHeadingContainer = styled(Grid)({
  paddingTop: "10px"
});

const StyledTypographyHeading = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(15),
  flexBasis: "33.33%",
  flexShrink: 0
}));

const StyledTypographySecondary = styled(Typography)(({ theme }) => ({
  flexBasis: "70%",
  fontSize: theme.typography.pxToRem(15)
}));

const StyledExpandIcon = styled("span")({
  paddingTop: "3px",
  paddingRight: "0px"
});

const StyledGridAlignCenter = styled(Grid)({
  alignItems: "center",
  justifyContent: "center"
});

const StyledGridAlignItems = styled(Grid)({
  alignItems: "center"
});

const StyledInputLabel = styled(InputLabel)({
  display: "inline-block",
  "& .MuiInputLabel-asterisk": {
    color: "red"
  }
});

const StyledDeleteIconContainer = styled(Grid)({
  padding: "10px 30px -1px 0px"
});

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

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

const FormElement = props => {
  const panel = "panel" + props.groupIndex.toString() + props.index.toString();
  const [dragElement, setDragElement] = useState(false);
  const disableFormElement = props.disableFormElement;

  const DragHandler = dragProps => (
    <StyledDragHandler {...dragProps}>
      <div hidden={!dragElement || disableFormElement}>
        <DragHandle color="disabled" />
      </div>
    </StyledDragHandler>
  );

  const handleDelete = event => {
    props.deleteGroup(props.groupIndex, props.index);
    event.stopPropagation();
  };

  return (
    <StyledAccordion
      TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
      expanded={props.formElementData.expanded}
      error={props.formElementData.error}
      onChange={event => props.handleGroupElementChange(props.groupIndex, "expanded", !props.formElementData.expanded, props.index)}
      onMouseEnter={() => setDragElement(true)}
      onMouseLeave={() => setDragElement(false)}
    >
      <StyledAccordionSummary aria-controls={panel + "bh-content"} id={panel + "bh-header"} {...props.dragHandleProps}>
        <Grid container direction="row">
          <StyledGridAlignCenter container>
            <DragHandler />
          </StyledGridAlignCenter>
          <StyledGridAlignItems
            container
            size={{
              sm: 12
            }}
          >
            <Grid>
              <StyledTypographySecondary>
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
                  <StyledIconContainer>
                    <Tooltip title={props.formElementData.concept.dataType}>
                      {dataTypeIcons[props.formElementData.concept.dataType]}
                    </Tooltip>
                  </StyledIconContainer>
                )}
                {props.formElementData.concept.dataType === "Coded" && (
                  <StyledIconContainer>
                    <Tooltip title={props.formElementData.concept.dataType + " : " + props.formElementData.type}>
                      {dataTypeIcons["concept"][props.formElementData.type]}
                    </Tooltip>
                  </StyledIconContainer>
                )}
              </StyledTypographySecondary>
            </Grid>
            <StyledHeadingContainer
              size={{
                sm: 10
              }}
            >
              <StyledTypographyHeading>
                <StyledExpandIcon>{props.formElementData.expanded ? <ExpandLess /> : <ExpandMore />}</StyledExpandIcon>
                <StyledInputLabel name={"name" + panel} required={props.formElementData.mandatory} disabled={disableFormElement}>
                  {props.formElementData.name}
                </StyledInputLabel>
              </StyledTypographyHeading>
            </StyledHeadingContainer>
            <StyledDeleteIconContainer
              size={{
                sm: 1
              }}
            >
              <IconButton aria-label="delete" onClick={handleDelete} disabled={disableFormElement} size="small">
                <Delete />
              </IconButton>
              <ToolTip title="APP_DESIGNER_FORM_ELEMENT_NAME" />
            </StyledDeleteIconContainer>
          </StyledGridAlignItems>
        </Grid>
      </StyledAccordionSummary>
      <StyledAccordionDetails>
        <FormElementTabs {...props} indexTab={props.groupIndex + "" + props.index} />
      </StyledAccordionDetails>
    </StyledAccordion>
  );
};

export default memo(FormElement, areEqual);
