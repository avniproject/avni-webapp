import { useState, memo } from "react";
import { styled, useTheme } from "@mui/material/styles";
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
import { areEqual, isEqual } from "lodash";
import { ToolTip } from "../../common/components/ToolTip";

const StyledAccordion = styled(Accordion)(({ error, theme }) => ({
  width: "100%",
  "&.Mui-expanded": {
    margin: 0
  },
  backgroundColor: "#E0E0E0"
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  position: "relative",
  backgroundColor: "#dbdbdb",
  paddingLeft: 0,
  paddingRight: 0,
  "&.Mui-focused": {
    backgroundColor: "#dbdbdb"
  },
  "& .MuiAccordionSummary-content": {
    margin: theme.spacing(1),
    "&.Mui-expanded": {
      margin: theme.spacing(1)
    }
  }
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  backgroundColor: "#fff",
  padding: theme.spacing(1.25)
}));

const StyledDragHandler = styled("div")(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(0.5),
  left: "50%",
  transform: "translateX(-50%)",
  height: 24,
  width: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}));

const StyledDragHandleContainer = styled("div", { shouldForwardProp: prop => prop !== "show" })(({ show }) => ({
  display: show ? "block" : "none"
}));

const StyledIconContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1)
}));

const StyledExpandIcon = styled(({ expanded, ...props }) => (expanded ? <ExpandLess {...props} /> : <ExpandMore {...props} />))(
  ({ theme }) => ({
    marginLeft: theme.spacing(0.25),
    marginRight: theme.spacing(0.75),
    display: "inline"
  })
);

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(15),
  whiteSpace: "normal",
  overflowWrap: "break-word",
  wordBreak: "break-all"
}));

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  display: "block",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  "& .MuiInputLabel-asterisk": {
    color: theme.palette.error.main
  }
}));

const StyledGridContainer = styled(Grid)(({ theme }) => ({
  alignItems: "center",
  width: "100%"
}));

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
  const panel = `panel${props.groupIndex}${props.index}`;
  const [dragElement, setDragElement] = useState(false);
  const disableFormElement = props.disableFormElement;
  const theme = useTheme();

  // Debug log: Inspect props
  console.log("[FormElement] Props received:", {
    groupIndex: props.groupIndex,
    index: props.index,
    formElementData: props.formElementData,
    disableFormElement
  });

  const DragHandler = ({ dragHandleProps }) => (
    <StyledDragHandler {...dragHandleProps}>
      <StyledDragHandleContainer show={dragElement && !disableFormElement}>
        <DragHandle color="disabled" />
      </StyledDragHandleContainer>
    </StyledDragHandler>
  );

  const handleDelete = event => {
    console.log("[FormElement] Deleting element:", { groupIndex: props.groupIndex, index: props.index });
    props.deleteGroup(props.groupIndex, props.index);
    event.stopPropagation();
  };

  const dataType = props.formElementData?.concept?.dataType || "";
  const elementType = props.formElementData?.type || "";
  const elementName = props.formElementData?.name || "";
  const isMandatory = props.formElementData?.mandatory || false;

  return (
    <StyledAccordion
      TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
      expanded={props.formElementData?.expanded || false}
      error={props.formElementData?.error || false}
      onChange={() => {
        console.log("[FormElement] Accordion toggled, expanded:", !props.formElementData?.expanded);
        props.handleGroupElementChange(props.groupIndex, "expanded", !props.formElementData?.expanded, props.index);
      }}
      onMouseEnter={() => setDragElement(true)}
      onMouseLeave={() => setDragElement(false)}
    >
      <StyledAccordionSummary aria-controls={`${panel}bh-content`} id={`${panel}bh-header`} {...props.dragHandleProps}>
        <StyledGridContainer container wrap="nowrap">
          <Grid item sx={{ display: "flex", alignItems: "center", gap: theme.spacing(0.5), flexBasis: "20%" }}>
            <StyledIconContainer>
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
              ].includes(dataType) && <Tooltip title={dataType}>{dataTypeIcons[dataType] || <b />}</Tooltip>}
              {dataType === "Coded" && (
                <Tooltip title={`${dataType}: ${elementType}`}>{dataTypeIcons.concept?.[elementType] || <b />}</Tooltip>
              )}
            </StyledIconContainer>
            <StyledExpandIcon expanded={props.formElementData?.expanded || false} />
          </Grid>

          <Grid item sx={{ display: "flex", alignItems: "center", gap: theme.spacing(0.5), flexBasis: "50%", flexShrink: 1, minWidth: 0 }}>
            <StyledTypography sx={{ flex: 1, minWidth: 120 }}>
              <StyledInputLabel name={`name${panel}`} required={isMandatory} disabled={disableFormElement}>
                {elementName}
              </StyledInputLabel>
            </StyledTypography>
          </Grid>

          <Grid item sx={{ display: "flex", alignItems: "center", gap: theme.spacing(0.5), flexBasis: "15%" }}>
            <DragHandler dragHandleProps={props.dragHandleProps} />
          </Grid>

          <Grid item sx={{ display: "flex", alignItems: "center", gap: theme.spacing(0.5), flexBasis: "15%", justifyContent: "flex-end" }}>
            <IconButton aria-label="delete" onClick={handleDelete} disabled={disableFormElement} size="small">
              <Delete fontSize="small" />
            </IconButton>
            <ToolTip title="APP_DESIGNER_FORM_ELEMENT_NAME" displayPosition="top" />
          </Grid>
        </StyledGridContainer>
      </StyledAccordionSummary>
      <StyledAccordionDetails>
        <FormElementTabs {...props} indexTab={`${props.groupIndex}${props.index}`} />
      </StyledAccordionDetails>
    </StyledAccordion>
  );
};

export default memo(FormElement, areEqual);
