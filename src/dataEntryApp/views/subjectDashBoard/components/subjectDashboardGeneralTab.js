import React, { Fragment } from "react";
import { Paper } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import Fab from "@material-ui/core/Fab";

const useStyles = makeStyles(theme => ({
  label: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  enrollButtonStyle: {
    marginBottom: theme.spacing(2)
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
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const classes = useStyles();

  return (
    <Fragment>
      <Paper className={classes.root}>
        <Grid container justify="flex-end">
          <Fab
            className={classes.enrollButtonStyle}
            variant="extended"
            color="primary"
            aria-label="add"
          >
            New Form
          </Fab>
        </Grid>
        <ExpansionPanel expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography className={classes.expansionHeading}>Planned visits</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container spacing={2}>
              {general.encounters
                ? general.encounters.map(row => (
                    <Grid key={row.operationalEncounterTypeName} item xs={6} sm={3}>
                      <Paper
                        style={{ boxShadow: "none", borderRight: "1px solid lightGrey" }}
                        className={classes.paper}
                      >
                        <List>
                          <ListItem className={classes.listItem}>
                            <ListItemText primary={row.operationalEncounterTypeName} />
                          </ListItem>
                          <ListItem className={classes.listItem}>
                            <ListItemText primary={row.encounterDateTime} />
                          </ListItem>
                          <ListItem className={classes.listItem}>
                            <ListItemText>
                              <label className={classes.programStatusStyle}>
                                {row.encounterDateTime}
                              </label>
                            </ListItemText>
                          </ListItem>
                        </List>
                        <Button color="primary">DO VISIT</Button>
                        <Button color="primary">CANCEL VISIT</Button>
                      </Paper>
                    </Grid>
                  ))
                : ""}
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel expanded={expanded === "panel2"} onChange={handleChange("panel2")}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography className={classes.expansionHeading}>Completed visits</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container spacing={2}>
              {general.encounters
                ? general.encounters.map(row => (
                    <Grid key={row.operationalEncounterTypeName} item xs={6} sm={3}>
                      <Paper
                        style={{ boxShadow: "none", borderRight: "1px solid lightGrey" }}
                        className={classes.paper}
                      >
                        <List>
                          <ListItem className={classes.listItem}>
                            <ListItemText primary={row.operationalEncounterTypeName} />
                          </ListItem>
                          <ListItem className={classes.listItem}>
                            <ListItemText primary={row.encounterDateTime} />
                          </ListItem>
                          <ListItem className={classes.listItem}>
                            <ListItemText>
                              <label>{row.encounterDateTime}</label>
                            </ListItemText>
                          </ListItem>
                        </List>
                        <Button color="primary">EDIT VISIT</Button>
                      </Paper>
                    </Grid>
                  ))
                : ""}
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Paper>
    </Fragment>
  );
};

export default SubjectDashboardGeneralTab;
