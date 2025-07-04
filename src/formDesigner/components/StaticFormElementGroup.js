import { useState } from "react";
import { ExpandMore, ExpandLess, Group } from "@mui/icons-material";
import { ToolTip } from "../../common/components/ToolTip";
import StaticFormElement from "../StaticFormElement";

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
    fontSize: theme.typography.pxToRem(15)
  }),
  ...(variant === "questionCount" && {
    paddingTop: "5px"
  })
}));

const StyledGroupIcon = styled(Group)({
  marginLeft: 12,
  marginRight: 4
});

const StyledExpandIcon = styled(({ component: Component, ...props }) => <Component {...props} />)({
  marginRight: "8px"
});

const StyledGridContainer = styled(Grid)({
  alignItems: "center"
});

const StyledAccordionDetails = styled(AccordionDetails)({
  padding: 0
});

const StyledFormElementContainer = styled("div")({
  paddingLeft: "20px",
  paddingBottom: "30px"
});

const StyledContentGrid = styled(Grid)({
  width: "100%",
  alignContent: "center",
  marginBottom: 8
});

const StyledOuterGrid = styled(Grid)({
  width: "100%",
  marginTop: 20
});

const StaticFormElementGroup = ({ name, formElements }) => {
  const panel = "static-panel";
  const [expanded, setExpanded] = useState(false);

  const renderFormElements = () => {
    const groupIndex = 1;
    return formElements.map(({ dataType, name }, index) => (
      <StyledFormElementContainer key={index}>
        <StaticFormElement name={name} index={index} dataType={dataType} groupIndex={groupIndex} />
      </StyledFormElementContainer>
    ));
  };

  return (
    <Grid size={12}>
      <StyledAccordion
        TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        sx={{ backgroundColor: "#E0E0E0" }}
      >
        <StyledAccordionSummary aria-controls={`${panel}-bh-content`} id={`${panel}-bh-header`}>
          <StyledGridContainer container size={{ sm: 12 }}>
            <Grid size={{ sm: 1 }}>
              <Tooltip title="Grouped Questions">
                <StyledGroupIcon />
              </Tooltip>
              {expanded ? <StyledExpandIcon component={ExpandLess} /> : <StyledExpandIcon component={ExpandMore} />}
            </Grid>
            <Grid size={{ sm: 6 }}>
              <StyledTypography variant="heading">
                <FormControl fullWidth>
                  <Input
                    type="text"
                    placeholder="Group name"
                    name={`name${panel}`}
                    disableUnderline
                    value={name}
                    autoComplete="off"
                    disabled
                  />
                </FormControl>
              </StyledTypography>
            </Grid>
            <Grid size={{ sm: 4 }}>
              <StyledTypography component="div" variant="questionCount">
                {formElements.length} questions
              </StyledTypography>
            </Grid>
            <Grid size={{ sm: 1 }}>
              <ToolTip title="APP_DESIGNER_FORM_ELEMENT_GROUP_NAME" displayPosition="bottom" />
            </Grid>
          </StyledGridContainer>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <StyledOuterGrid direction="column">
            <StyledContentGrid>{renderFormElements()}</StyledContentGrid>
          </StyledOuterGrid>
        </StyledAccordionDetails>
      </StyledAccordion>
    </Grid>
  );
};

export default StaticFormElementGroup;
