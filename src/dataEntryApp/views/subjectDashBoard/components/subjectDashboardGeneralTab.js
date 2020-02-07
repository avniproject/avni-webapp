import React, { Fragment } from "react";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import Visit from "./Visit";
import SubjectButton from "./Button";

const useStyles = makeStyles(theme => ({
  label: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  expansionPanel: {
    marginBottom: "11px"
  },
  root: {
    flexGrow: 1,
    padding: theme.spacing(2)
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "left"
  },
  programStatusStyle: {
    color: "red",
    backgroundColor: "#FFB6C1",
    borderRadius: "5px"
  },
  expansionHeading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0
  },
  listItem: {
    paddingBottom: "0px",
    paddingTop: "0px"
  }
}));

const SubjectDashboardGeneralTab = ({ general }) => {
  const [expanded, setExpanded] = React.useState("");

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const classes = useStyles();

  return (
    <Fragment>
      <Paper className={classes.root}>
        <Grid container justify="flex-end">
          <SubjectButton btnLabel="New Form" />
        </Grid>
        <ExpansionPanel
          className={classes.expansionPanel}
          expanded={expanded === "plannedVisitPanel"}
          onChange={handleChange("plannedVisitPanel")}
        >
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="plannedVisitPanelbh-content"
            id="plannedVisitPanelbh-header"
          >
            <Typography component={"span"} className={classes.expansionHeading}>
              Planned visits
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container spacing={2}>
              {general.encounters
                ? general.encounters.map((row, index) =>
                    !row.encounterDateTime ? (
                      <Visit
                        key={index}
                        name={row.operationalEncounterTypeName}
                        index={index}
                        visitDate={row.earliestVisitDateTime}
                        overdueDate={row.maxVisitDateTime}
                      />
                    ) : (
                      ""
                    )
                  )
                : ""}
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel
          className={classes.expansionPanel}
          expanded={expanded === "completedVisitPanel"}
          onChange={handleChange("completedVisitPanel")}
        >
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="completedVisitPanelbh-content"
            id="completedVisitPanelbh-header"
          >
            <Typography component={"span"} className={classes.expansionHeading}>
              Completed visits
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container spacing={2}>
              {general.encounters
                ? general.encounters.map((row, index) =>
                    row.encounterDateTime ? (
                      <Visit
                        key={index}
                        name={row.operationalEncounterTypeName}
                        index={index}
                        visitDate={row.encounterDateTime}
                        earliestVisitDate={row.earliestVisitDateTime}
                      />
                    ) : (
                      ""
                    )
                  )
                : ""}
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Paper>
    </Fragment>
  );
};

export default SubjectDashboardGeneralTab;
