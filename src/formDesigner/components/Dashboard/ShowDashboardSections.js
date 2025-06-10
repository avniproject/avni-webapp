import React from "react";
import { Accordion, AccordionDetails, AccordionSummary, Tooltip, Typography, Grid } from "@mui/material";
import { ExpandMore, ExpandLess, List } from "@mui/icons-material";
import { isEmpty, map, orderBy } from "lodash";
import { withStyles, makeStyles } from "@mui/styles";
import ShowDashboardSectionCards from "./ShowDashboardSectionCards";
import { ShowLabelValue } from "../../common/ShowLabelValue";
import WebDashboardSection from "../../../common/model/reports/WebDashboardSection";

const useStyles = makeStyles(theme => ({
  parent: {
    paddingLeft: 0,
    paddingBottom: 30
  },
  root: {
    width: "100%"
  },
  rootError: {
    width: "100%",
    border: "1px solid red"
  },
  iconlay: {
    flex: 1,
    alignItems: "center"
  },
  questionCount: {
    paddingTop: "5px"
  },
  absolute: {
    position: "absolute",
    marginLeft: 20,
    marginTop: -20
  },
  heading: {
    fontSize: theme.typography.pxToRem(15)
  },
  secondaryHeading: {
    flexBasis: "70%",
    fontSize: theme.typography.pxToRem(15)
  },
  tabs: {
    minHeight: "26px",
    height: "26px"
  },
  tab: {
    minHeight: "26px",
    height: "26px"
  },
  formElementGroupInputText: {
    lineHeight: "56px"
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

const StyledAccordionSummary = withStyles({
  root: {
    paddingRight: 0,
    backgroundColor: "#dbdbdb",
    border: "1px solid #2196F3",
    paddingLeft: 0,
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
    margin: "0",
    "&$expanded": { margin: "0" }
  },
  expanded: {},
  icon: {
    marginHorizontal: "8px",
    display: "inline"
  }
})(AccordionSummary);

const ShowDashboardSections = ({ sections, history }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <React.Fragment>
      {!isEmpty(sections) && (
        <div>
          {map(orderBy(sections, "displayOrder"), (section, index) => (
            <div key={index}>
              <StyledAccordion expanded={expanded === "panel" + index} onChange={handleChange("panel" + index)}>
                <StyledAccordionSummary aria-controls={"panel" + index + "bh-content"} id={"panel" + index + "bh-header"}>
                  <Grid container direction="row">
                    <Grid container item sm={12} alignItems="center">
                      <Grid item sm={1}>
                        <Tooltip title="Grouped Questions">
                          <List style={{ marginLeft: 12, marginRight: 4 }} />
                        </Tooltip>
                        {expanded === "panel" + index ? <ExpandLess className={classes.icon} /> : <ExpandMore className={classes.icon} />}
                      </Grid>
                      <Grid item sm={5}>
                        <Typography className={classes.heading}>{section.name}</Typography>
                      </Grid>
                      <Grid item sm={3}>
                        <Typography className={classes.questionCount}>
                          {WebDashboardSection.getReportCards(section).length} cards
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </StyledAccordionSummary>
                <AccordionDetails>
                  <Grid container>
                    <Grid item xs={12}>
                      <ShowLabelValue label="Description" value={section.description} />
                    </Grid>
                    <Grid item xs={12}>
                      <ShowLabelValue label="View Type" value={section.viewType} />
                    </Grid>
                    <Grid item xs={12}>
                      <ShowDashboardSectionCards section={section} cards={WebDashboardSection.getReportCards(section)} history={history} />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </StyledAccordion>
            </div>
          ))}
        </div>
      )}
    </React.Fragment>
  );
};

export default ShowDashboardSections;
