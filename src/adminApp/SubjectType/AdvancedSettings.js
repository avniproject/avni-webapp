import React, { useEffect } from "react";
import { withStyles } from "@material-ui/core/styles";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";
import { AddressLevelSetting } from "./AddressLevelSetting";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import { ValidFormat } from "./ValidFormat";
import { CustomisedExpansionPanelSummary } from "../components/CustomisedExpansionPanelSummary";
import { findFormUuidForSubjectType } from "../domain/formMapping";
import http from "../../common/utils/httpClient";
import { forEach } from "lodash";
import { OptionSelect } from "./OptionSelect";
import { Box } from "@material-ui/core";

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
    padding: theme.spacing.unit * 2,
    display: "block"
  }
}))(MuiExpansionPanelDetails);

export const AdvancedSettings = ({
  subjectType,
  dispatch,
  locationTypes,
  formMappings,
  isEdit
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [syncAttributes, setSyncAttributes] = React.useState([]);
  const formUuid = findFormUuidForSubjectType(subjectType, formMappings);
  const changeSyncAttribute = (name, value) =>
    dispatch({ type: "syncAttribute", payload: { name, value } });

  const onSyncConceptChange = (name, value) => {
    const syncAttributeChangeMessage =
      "After changing the sync concept check the usability status on details page. Once this attribute is usable ask users to perform fresh sync.";
    if (!isEdit) {
      changeSyncAttribute(name, value);
    } else if (window.confirm(syncAttributeChangeMessage)) {
      changeSyncAttribute(name, value);
    }
  };

  useEffect(() => {
    if (formUuid) {
      http
        .get(`/forms/export?formUUID=${formUuid}`)
        .then(response => {
          const form = response.data;
          const syncAttributes = [];
          forEach(form.formElementGroups, feg => {
            forEach(feg.formElements, fe => {
              if (!feg.voided && !fe.voided) {
                const concept = fe.concept;
                syncAttributes.push({ label: concept.name, value: concept.uuid });
              }
            });
          });
          setSyncAttributes(syncAttributes);
        })
        .catch(error => {});
    }
  }, [formUuid]);

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
          <Box component={"div"} mt={3} mb={2} p={2} border={1} borderColor={"#e1e1e1"}>
            <Typography gutterBottom variant={"subtitle1"}>
              {"Sync Settings"}
            </Typography>
            <AvniSwitch
              switchFirst
              checked={!!subjectType.shouldSyncByLocation}
              onChange={event => changeSyncAttribute("shouldSyncByLocation", event.target.checked)}
              name="Sync by location"
              toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_SYC_BY_LOCATION"}
            />
            <AvniSwitch
              switchFirst
              checked={!!subjectType.directlyAssignable}
              onChange={event => changeSyncAttribute("directlyAssignable", event.target.checked)}
              name="Sync by direct assignment"
              toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_SYNC_BY_DIRECT_ASSIGNMENT"}
            />
            <OptionSelect
              label={"Sync Registration Concept 1"}
              options={syncAttributes}
              value={subjectType.syncRegistrationConcept1}
              onChange={value => onSyncConceptChange("syncRegistrationConcept1", value)}
            />
            <OptionSelect
              label={"Sync Registration Concept 2"}
              options={syncAttributes}
              value={subjectType.syncRegistrationConcept2}
              onChange={value => onSyncConceptChange("syncRegistrationConcept2", value)}
            />
          </Box>
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
