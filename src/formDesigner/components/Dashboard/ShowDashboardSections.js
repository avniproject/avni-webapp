import { Fragment, useState } from "react";
import { styled } from "@mui/material/styles";
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

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: "#dbdbdb",
  border: "1px solid #2196F3",
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
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

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "block",
  overflow: "visible",
  minHeight: "100px"
}));

const StyledHeading = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(15)
}));

const StyledQuestionCount = styled(Typography)({
  paddingTop: "5px"
});

const StyledIcon = styled("span")(({ variant }) => ({
  ...(variant === "list" && {
    marginRight: 4
  }),
  ...(variant !== "list" && {
    marginRight: 4
  })
}));

const ShowDashboardSections = ({ sections }) => {
  const [expanded, setExpanded] = useState(null);

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const renderSummaryText = (section, index, expanded) => {
    return (
      <div style={{ display: "flex", alignItems: "center", width: "100%", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <Tooltip title="Grouped Questions">
            <StyledIcon as={List} variant="list" />
          </Tooltip>
          <StyledIcon as={expanded === `panel${index}` ? ExpandLess : ExpandMore} />
        </div>
        <div style={{ flex: "1 1 0", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <StyledHeading>{section.name}</StyledHeading>
        </div>
        <div style={{ flex: "1 1 0", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <StyledQuestionCount>{WebDashboardSection.getReportCards(section).length} cards</StyledQuestionCount>
        </div>
      </div>
    );
  };

  return (
    <StyledContainer>
      {!isEmpty(sections) && (
        <Fragment>
          {map(orderBy(sections, "displayOrder"), (section, index) => (
            <div key={index}>
              <StyledAccordion expanded={expanded === `panel${index}`} onChange={handleChange(`panel${index}`)}>
                <StyledAccordionSummary aria-controls={`panel${index}bh-content`} id={`panel${index}bh-header`}>
                  <Grid container alignItems="center" wrap="nowrap" sx={{ width: "100%", display: "flex" }}>
                    <Grid
                      item
                      sx={{
                        flex: "1 1 auto",
                        display: "flex",
                        alignItems: "center",
                        ml: 0,
                        mr: 2,
                        gap: 2
                      }}
                    >
                      {renderSummaryText(section, index, expanded)}
                    </Grid>
                  </Grid>
                </StyledAccordionSummary>
                <StyledAccordionDetails>
                  <Grid container>
                    <Grid size={12}>
                      <ShowLabelValue label="Description" value={section.description} />
                    </Grid>
                    <Grid size={12}>
                      <ShowLabelValue label="View Type" value={section.viewType} />
                    </Grid>
                    <Grid size={12}>
                      <ShowDashboardSectionCards section={section} cards={WebDashboardSection.getReportCards(section)} />
                    </Grid>
                  </Grid>
                </StyledAccordionDetails>
              </StyledAccordion>
            </div>
          ))}
        </Fragment>
      )}
    </StyledContainer>
  );
};

export default ShowDashboardSections;
