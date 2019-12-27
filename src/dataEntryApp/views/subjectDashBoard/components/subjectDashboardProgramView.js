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

const useStyles = makeStyles(theme => ({
  enrollButtonStyle: {
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  root: {
    flexGrow: 1,
    padding: theme.spacing(2)
  }
}));

const ProgramView = ({ programData }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <label>
            {programData.ProgramName} program details - {programData.programType}
          </label>
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
        <ExpansionPanel expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography className={classes.expansionHeading}>Enrollment details</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails />
        </ExpansionPanel>
        <ExpansionPanel expanded={expanded === "panel2"} onChange={handleChange("panel2")}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography className={classes.expansionHeading}>Planned visits</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails />
        </ExpansionPanel>
        <ExpansionPanel expanded={expanded === "panel3"} onChange={handleChange("panel3")}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography className={classes.expansionHeading}>Completed visit</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails />
        </ExpansionPanel>
      </Paper>
    </div>
  );
};

export default ProgramView;
