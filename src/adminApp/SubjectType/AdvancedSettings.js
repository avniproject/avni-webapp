import React from "react";
import { withStyles } from "@material-ui/core/styles";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";
import { AddressLevelSetting } from "./AddressLevelSetting";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import { ValidFormat } from "./ValidFormat";
import { CustomisedExpansionPanelSummary } from "../components/CustomisedExpansionPanelSummary";

const ExpansionPanel = withStyles({
  root: {
    border: "1px solid rgba(0,0,0,.125)",
    boxShadow: "none"
  },
  expanded: {
    margin: "auto"
  }
})(MuiExpansionPanel);

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
      <CustomisedExpansionPanelSummary>
        <Typography>Advanced settings</Typography>
      </CustomisedExpansionPanelSummary>
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
          <p />
          <ValidFormat
            subjectType={subjectType}
            dispatch={dispatch}
            regexLabel={subjectType.type === "Person" ? "First Name Regex" : "Name Regex"}
            regexToolTipKey={"APP_DESIGNER_FIRST_NAME_REGEX"}
            regexID={"validFirstNameRegex"}
            descKeyLabel={
              subjectType.type === "Person"
                ? "First Name Validation Description Key"
                : "Name Validation Description Key"
            }
            descToolTipKey={"APP_DESIGNER_FIRST_NAME_DESCRIPTION_KEY"}
            descID={"validFirstNameDescriptionKey"}
            propertyName={"validFirstNameFormat"}
          />
          {subjectType.type === "Person" && (
            <ValidFormat
              subjectType={subjectType}
              dispatch={dispatch}
              regexLabel={"Last Name Regex"}
              regexToolTipKey={"APP_DESIGNER_LAST_NAME_REGEX"}
              regexID={"validLastNameRegex"}
              descKeyLabel={"Last Name Validation Description Key"}
              descToolTipKey={"APP_DESIGNER_LAST_NAME_DESCRIPTION_KEY"}
              descID={"validLastNameDescriptionKey"}
              propertyName={"validLastNameFormat"}
            />
          )}
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
