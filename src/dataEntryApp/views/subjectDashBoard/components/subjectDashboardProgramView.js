import React from "react";
import Grid from "@material-ui/core/Grid";
import Fab from "@material-ui/core/Fab";
import { makeStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import moment from "moment/moment";
import Observations from "../../../../common/components/Observations";

import Button from "@material-ui/core/Button";

const useStyles = makeStyles(theme => ({
  enrollButtonStyle: {
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(2)
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
  },
  table: {
    border: "1px solid rgba(224, 224, 224, 1)"
  },
  abnormalColor: {
    color: "#ff4f33"
  }
}));

const ProgramView = ({ programData }) => {
  const classes = useStyles();
  const [expandedPanel, setExpanded] = React.useState("");

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <label>{programData.operationalProgramName} program details</label>
        </Grid>
        <Grid item xs={6}>
          <Fab
            className={classes.enrollButtonStyle}
            variant="extended"
            color="primary"
            aria-label="add"
          >
            Growth Chart
          </Fab>
          <Fab
            className={classes.enrollButtonStyle}
            variant="extended"
            color="primary"
            aria-label="add"
          >
            Vaccinations
          </Fab>
          <Fab
            className={classes.enrollButtonStyle}
            variant="extended"
            color="primary"
            aria-label="add"
          >
            New Program Visit
          </Fab>
        </Grid>
      </Grid>
      <Paper className={classes.root}>
        <ExpansionPanel expanded={expandedPanel === "panel1"} onChange={handleChange("panel1")}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography component={"span"} className={classes.expansionHeading}>
              Enrollment details
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid item xs={12}>
              <List>
                <Observations observations={programData ? programData.observations : ""} />
              </List>
              <Button color="primary">VOID</Button>
              <Button color="primary">EDIT</Button>
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel expanded={expandedPanel === "panel2"} onChange={handleChange("panel2")}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography component={"span"} className={classes.expansionHeading}>
              Planned visits
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container spacing={2}>
              {programData && programData.encounters
                ? programData.encounters.map(row =>
                    !row.encounterDateTime ? (
                      <Grid key={row.name} item xs={6} sm={3}>
                        <Paper
                          style={{ boxShadow: "none", borderRight: "1px solid lightGrey" }}
                          className={classes.paper}
                        >
                          <List>
                            <ListItem className={classes.listItem}>
                              <ListItemText primary={row.name} />
                            </ListItem>
                            <ListItem className={classes.listItem}>
                              <ListItemText
                                primary={moment(new Date(row.earliestVisitDateTime)).format(
                                  "DD-MM-YYYY"
                                )}
                              />
                            </ListItem>
                            {new Date() > new Date(row.maxVisitDateTime) ? (
                              <ListItem className={classes.listItem}>
                                <ListItemText>
                                  <label className={classes.programStatusStyle}>Overdue</label>
                                </ListItemText>
                              </ListItem>
                            ) : (
                              ""
                            )}
                          </List>
                          <Button color="primary">DO VISIT</Button>
                          <Button color="primary">CANCEL VISIT</Button>
                        </Paper>
                      </Grid>
                    ) : (
                      ""
                    )
                  )
                : ""}
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel expanded={expandedPanel === "panel3"} onChange={handleChange("panel3")}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography component={"span"} className={classes.expansionHeading}>
              Completed visit
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container spacing={2}>
              {programData && programData.encounters
                ? programData.encounters.map(row =>
                    row.encounterDateTime ? (
                      <Grid key={row.name} item xs={6} sm={3}>
                        <Paper
                          style={{ boxShadow: "none", borderRight: "1px solid lightGrey" }}
                          className={classes.paper}
                        >
                          <List>
                            <ListItem className={classes.listItem}>
                              <ListItemText primary={row.name} />
                            </ListItem>
                            <ListItem className={classes.listItem}>
                              <ListItemText
                                primary={moment(new Date(row.encounterDateTime)).format(
                                  "DD-MM-YYYY"
                                )}
                              />
                            </ListItem>
                            <ListItem className={classes.listItem}>
                              <label style={{ fontSize: "14px" }}>
                                {`Scheduled on :${moment(
                                  new Date(row.earliestVisitDateTime)
                                ).format("DD-MM-YYYY")}`}{" "}
                              </label>
                            </ListItem>
                          </List>
                          <Button color="primary">DO VISIT</Button>
                          <Button color="primary">CANCEL VISIT</Button>
                        </Paper>
                      </Grid>
                    ) : (
                      ""
                    )
                  )
                : ""}
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Paper>
    </div>
  );
};

export default ProgramView;
