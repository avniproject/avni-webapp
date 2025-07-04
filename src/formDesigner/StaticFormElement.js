import { styled } from "@mui/material/styles";
import { Accordion, Typography, Tooltip, Grid, InputLabel, AccordionSummary } from "@mui/material";
import { ToolTip } from "../common/components/ToolTip";
import { dataTypeIcons } from "./components/FormElement";

const StyledAccordion = styled(Accordion)({
  width: "100%",
  "&.Mui-expanded": {
    margin: 0
  }
});

const StyledAccordionSummary = styled(AccordionSummary)({
  paddingRight: 0,
  backgroundColor: "#dbdbdb",
  border: "1px solid #2196F3",
  paddingLeft: 0,
  minHeight: 56,
  "&.Mui-expanded": {
    minHeight: 56
  },
  "&.Mui-focused": {
    backgroundColor: "#dbdbdb"
  },
  "& .MuiAccordionSummary-content": {
    margin: "0",
    "&.Mui-expanded": {
      margin: "0"
    }
  }
});

const StyledTypography = styled(Typography)(({ theme, variant }) => ({
  ...(variant === "heading" && {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
    paddingTop: "10px"
  }),
  ...(variant === "secondaryHeading" && {
    flexBasis: "70%",
    fontSize: theme.typography.pxToRem(15)
  })
}));

const StyledDiv = styled("div")(({ variant }) => ({
  ...(variant === "iconlay" && {
    paddingTop: "3px"
  }),
  ...(variant === "iconDataType" && {
    padding: "10px"
  })
}));

const StyledInputLabel = styled(InputLabel)({
  display: "inline-block",
  "& .MuiInputLabel-asterisk": {
    color: "red"
  }
});

const StyledGridContainer = styled(Grid)({
  alignItems: "center"
});

const StyledGrid = styled(Grid)({
  paddingTop: "10px"
});

const StaticFormElement = ({ groupIndex, index, dataType, name, ...props }) => {
  const panel = `panel${groupIndex}${index}`;

  return (
    <StyledAccordion TransitionProps={{ mountOnEnter: false, unmountOnExit: false }} expanded={false}>
      <StyledAccordionSummary aria-controls={`${panel}bh-content`} id={`${panel}bh-header`}>
        <StyledDiv variant="iconlay">
          <StyledTypography component="div" variant="secondaryHeading">
            {["Date", "Numeric", "Text"].includes(dataType) && (
              <StyledDiv variant="iconDataType">
                <Tooltip title={dataType}>{dataTypeIcons[dataType]}</Tooltip>
              </StyledDiv>
            )}
            {dataType === "Coded" && (
              <StyledDiv variant="iconDataType">
                <Tooltip title={`${dataType} : SingleSelect`}>{dataTypeIcons["concept"]["SingleSelect"]}</Tooltip>
              </StyledDiv>
            )}
          </StyledTypography>
        </StyledDiv>
        <StyledGridContainer container size={{ sm: 12 }}>
          <StyledGrid size={{ sm: 11 }}>
            <StyledTypography component="span" variant="heading">
              <StyledInputLabel name={`name${panel}`} required>
                {name}
              </StyledInputLabel>
            </StyledTypography>
          </StyledGrid>
          <Grid direction="row" size={{ sm: 1 }}>
            <ToolTip toolTipKey="APP_DESIGNER_FORM_ELEMENT_NAME" onHover displayPosition="bottom" />
          </Grid>
        </StyledGridContainer>
      </StyledAccordionSummary>
    </StyledAccordion>
  );
};

export default StaticFormElement;
