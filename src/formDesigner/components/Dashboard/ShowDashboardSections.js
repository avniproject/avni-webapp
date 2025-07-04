import { useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Tooltip, Typography, Grid } from "@mui/material";
import { ExpandMore, ExpandLess, List } from "@mui/icons-material";
import { isEmpty, map, orderBy } from "lodash";
import ShowDashboardSectionCards from "./ShowDashboardSectionCards";
import { ShowLabelValue } from "../../common/ShowLabelValue";
import WebDashboardSection from "../../../common/model/reports/WebDashboardSection";

const StyledContainer = styled("div")({
  paddingLeft: 0,
  paddingBottom: 30
});

const StyledAccordion = styled(Accordion)({
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

const StyledIconContainer = styled(Grid)({
  alignItems: "center"
});

const StyledListIcon = styled(List)({
  marginLeft: 12,
  marginRight: 4
});

const StyledHeading = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(15)
}));

const StyledQuestionCount = styled(Typography)({
  paddingTop: "5px"
});

const ShowDashboardSections = ({ sections, history }) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <StyledContainer>
      {!isEmpty(sections) && (
        <div>
          {map(orderBy(sections, "displayOrder"), (section, index) => (
            <div key={index}>
              <StyledAccordion expanded={expanded === "panel" + index} onChange={handleChange("panel" + index)}>
                <StyledAccordionSummary aria-controls={`panel${index}bh-content`} id={`panel${index}bh-header`}>
                  <Grid container direction="row">
                    <StyledIconContainer container size={{ sm: 12 }}>
                      <Grid size={{ sm: 1 }}>
                        <Tooltip title="Grouped Questions">
                          <StyledListIcon />
                        </Tooltip>
                        {expanded === `panel${index}` ? <ExpandLess /> : <ExpandMore />}
                      </Grid>
                      <Grid size={{ sm: 5 }}>
                        <StyledHeading>{section.name}</StyledHeading>
                      </Grid>
                      <Grid size={{ sm: 3 }}>
                        <StyledQuestionCount>{WebDashboardSection.getReportCards(section).length} cards</StyledQuestionCount>
                      </Grid>
                    </StyledIconContainer>
                  </Grid>
                </StyledAccordionSummary>
                <AccordionDetails>
                  <Grid container>
                    <Grid size={12}>
                      <ShowLabelValue label="Description" value={section.description} />
                    </Grid>
                    <Grid size={12}>
                      <ShowLabelValue label="View Type" value={section.viewType} />
                    </Grid>
                    <Grid size={12}>
                      <ShowDashboardSectionCards section={section} cards={WebDashboardSection.getReportCards(section)} history={history} />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </StyledAccordion>
            </div>
          ))}
        </div>
      )}
    </StyledContainer>
  );
};

export default ShowDashboardSections;
