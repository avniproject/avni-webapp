import { styled, useTheme } from "@mui/material/styles";
import { Accordion, AccordionSummary, Typography, Tooltip, Grid, InputLabel } from "@mui/material";
import { ToolTip } from "../common/components/ToolTip";
import { dataTypeIcons } from "./components/FormElement";

const StyledAccordion = styled(Accordion)(({ theme }) => ({
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
  minHeight: 56,
  "&.Mui-expanded": {
    minHeight: 56
  },
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

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(15)
}));

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  display: "inline-block",
  "& .MuiInputLabel-asterisk": {
    color: theme.palette.error.main
  }
}));

const StyledIconContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1)
}));

const StaticFormElement = ({ groupIndex, index, dataType, name }) => {
  const panel = `panel${groupIndex}${index}`;
  const theme = useTheme();

  // Debug log to inspect props
  console.log("[StaticFormElement] Props received:", { groupIndex, index, dataType, name });

  return (
    <StyledAccordion TransitionProps={{ mountOnEnter: false, unmountOnExit: false }} expanded={false}>
      <StyledAccordionSummary aria-controls={`${panel}bh-content`} id={`${panel}bh-header`}>
        <Grid container alignItems="center" wrap="nowrap" sx={{ width: "100%" }}>
          <Grid sx={{ display: "flex", alignItems: "center", gap: theme.spacing(0.5), flexBasis: "20%" }}>
            <StyledIconContainer>
              {["Date", "Numeric", "Text"].includes(dataType) && <Tooltip title={dataType}>{dataTypeIcons[dataType]}</Tooltip>}
              {dataType === "Coded" && (
                <Tooltip title={`${dataType}: SingleSelect`}>{dataTypeIcons["concept"]?.["SingleSelect"] || null}</Tooltip>
              )}
            </StyledIconContainer>
          </Grid>

          <Grid sx={{ display: "flex", alignItems: "center", gap: theme.spacing(0.5), flexBasis: "65%" }}>
            <StyledTypography sx={{ flex: 1, minWidth: 120 }}>
              <StyledInputLabel name={`name${panel}`} required>
                {name || ""}
              </StyledInputLabel>
            </StyledTypography>
          </Grid>

          <Grid sx={{ display: "flex", alignItems: "center", gap: theme.spacing(0.5), flexBasis: "15%", justifyContent: "flex-end" }}>
            <ToolTip title="APP_DESIGNER_FORM_ELEMENT_NAME" displayPosition="top" />
          </Grid>
        </Grid>
      </StyledAccordionSummary>
    </StyledAccordion>
  );
};

export default StaticFormElement;
