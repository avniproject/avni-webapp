import React from "react";
import { withStyles } from "@material-ui/core/styles";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";
import { AddressLevelSetting } from "./AddressLevelSetting";
import { AvniSwitch } from "../../common/components/AvniSwitch";

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

export const AdvancedSettings = ({ subjectType, dispatch, locationTypes }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <ExpansionPanel square expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <ExpansionPanelSummary>
        <Typography>Advanced settings</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <div style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <AddressLevelSetting
            levelUUIDs={subjectType.locationTypeUUIDs}
            setLevelUUIDs={uuids => dispatch({ type: "locationTypes", payload: uuids })}
            locationTypes={locationTypes}
          />
          <AvniSwitch
            switchFirst
            checked={!!subjectType.allowEmptyLocation}
            onChange={event =>
              dispatch({ type: "allowEmptyLocation", payload: event.target.checked })
            }
            name="Allow Empty Location"
            toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_ALLOW_EMPTY_LOCATION"}
          />
          <AvniSwitch
            switchFirst
            checked={!!subjectType.uniqueName}
            onChange={event => dispatch({ type: "uniqueName", payload: event.target.checked })}
            name="Unique Name"
            toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_UNIQUE_NAME"}
          />
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
