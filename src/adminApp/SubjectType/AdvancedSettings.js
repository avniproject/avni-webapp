import React from "react";
import { withStyles } from "@material-ui/core/styles";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";
import { AddressLevelSetting } from "./AddressLevelSetting";

const ExpansionPanel = withStyles({
  root: {
    border: "1px solid rgba(0,0,0,.125)",
    boxShadow: "none"
  },
  expanded: {
    margin: "auto"
  }
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
  root: {
    backgroundColor: "rgba(0,0,0,0.07)",
    borderBottom: "1px solid rgba(0,0,0,.125)",
    marginBottom: -1,
    minHeight: 40,
    "&$expanded": {
      minHeight: 40
    }
  },
  content: {
    "&$expanded": {
      margin: "12px 0"
    }
  },
  expanded: {}
})(props => <MuiExpansionPanelSummary {...props} />);

ExpansionPanelSummary.muiName = "ExpansionPanelSummary";

const ExpansionPanelDetails = withStyles(theme => ({
  root: {
    marginTop: 10,
    marginBottom: 10,
    padding: theme.spacing.unit * 2
  }
}))(MuiExpansionPanelDetails);

export const AdvancedSettings = ({ levelUUIDs, setLevelUUIDs, locationTypes }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <ExpansionPanel square expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <ExpansionPanelSummary>
        <Typography>Advanced settings</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <AddressLevelSetting
          levelUUIDs={levelUUIDs}
          setLevelUUIDs={setLevelUUIDs}
          locationTypes={locationTypes}
        />
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
