import React, { useEffect } from "react";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { AddressLevelSetting } from "./AddressLevelSetting";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import { ValidFormat } from "./ValidFormat";
import { CustomisedAccordionSummary } from "../components/CustomisedExpansionPanelSummary";
import { findFormUuidForSubjectType } from "../domain/formMapping";
import http from "../../common/utils/httpClient";
import { forEach, get, includes, isEmpty } from "lodash";
import { OptionSelect } from "./OptionSelect";
import { Accordion, AccordionDetails, Box, Input } from "@material-ui/core";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { SubjectTypeType } from "./Types";

const CustomAccordion = withStyles({
  root: {
    border: "1px solid rgba(0,0,0,.125)",
    boxShadow: "none"
  },
  expanded: {
    margin: "auto"
  }
})(props => <Accordion {...props} />);
CustomAccordion.muiName = "Accordion";

const CustomAccordianDetails = withStyles(theme => ({
  root: {
    marginTop: 10,
    marginBottom: 10,
    padding: theme.spacing.unit * 2,
    display: "block"
  }
}))(props => <AccordionDetails {...props} />);
CustomAccordianDetails.muiName = "AccordionDetails";

const syncAttributeDataTypes = ["Numeric", "Coded", "Text"];
export const AdvancedSettings = ({ subjectType, dispatch, locationTypes, formMappings, isEdit }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [syncAttributes, setSyncAttributes] = React.useState([]);
  const formUuid = findFormUuidForSubjectType(subjectType, formMappings);
  const changeSyncAttribute = (name, value) => dispatch({ type: "syncAttribute", payload: { name, value } });

  const onSyncConceptChange = (name, value) => {
    const syncAttributeChangeMessage =
      "Changing sync attributes will ask the users to reset their sync. This might take time depending on the data.";
    if (!isEdit) {
      changeSyncAttribute(name, value);
    } else if (window.confirm(syncAttributeChangeMessage)) {
      changeSyncAttribute(name, value);
    }
  };

  useEffect(() => {
    if (formUuid) {
      http.get(`/forms/export?formUUID=${formUuid}`).then(response => {
        const form = response.data;
        const syncAttributes = [];
        forEach(form.formElementGroups, feg => {
          forEach(feg.formElements, fe => {
            const concept = fe.concept;
            if (!feg.voided && !fe.voided && fe.mandatory && includes(syncAttributeDataTypes, concept.dataType)) {
              syncAttributes.push({ label: concept.name, value: concept.uuid });
            }
          });
        });
        setSyncAttributes(syncAttributes);
      });
    }
  }, [formUuid]);

  return (
    <CustomAccordion square expanded={expanded} onChange={() => setExpanded(expanded => !expanded)}>
      <CustomisedAccordionSummary>
        <Typography>Advanced settings</Typography>
      </CustomisedAccordionSummary>
      <CustomAccordianDetails>
        <div style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <AddressLevelSetting
            levelUUIDs={subjectType.locationTypeUUIDs}
            setLevelUUIDs={uuids => dispatch({ type: "locationTypes", payload: uuids })}
            locationTypes={locationTypes}
          />
          <AvniSwitch
            switchFirst
            checked={!!subjectType.allowEmptyLocation}
            onChange={event => dispatch({ type: "allowEmptyLocation", payload: event.target.checked })}
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
          <AvniSwitch
            switchFirst
            checked={!!subjectType.allowProfilePicture}
            onChange={event => dispatch({ type: "allowProfilePicture", payload: event.target.checked })}
            name="Allow Profile Picture"
            toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_ALLOW_PROFILE_PICTURE"}
          />
          <p />
          <ValidFormat
            subjectType={subjectType}
            dispatch={dispatch}
            regexLabel={subjectType.type === "Person" ? "First Name Regex" : "Name Regex"}
            regexToolTipKey={"APP_DESIGNER_FIRST_NAME_REGEX"}
            regexID={"validFirstNameRegex"}
            descKeyLabel={subjectType.type === "Person" ? "First Name Validation Description Key" : "Name Validation Description Key"}
            descToolTipKey={"APP_DESIGNER_FIRST_NAME_DESCRIPTION_KEY"}
            descID={"validFirstNameDescriptionKey"}
            propertyName={"validFirstNameFormat"}
          />
          {subjectType.type === "Person" && (
            <>
              <p />
              <AvniSwitch
                checked={!!subjectType.allowMiddleName}
                onChange={event =>
                  dispatch({
                    type: "allowMiddleName",
                    payload: event.target.checked
                  })
                }
                name="Allow middle name"
                toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_ALLOW_MIDDLE_NAME"}
              />
              <p />
              {subjectType.allowMiddleName && (
                <>
                  <ValidFormat
                    subjectType={subjectType}
                    dispatch={dispatch}
                    regexLabel={"Middle Name Regex"}
                    regexToolTipKey={"APP_DESIGNER_SUBJECT_TYPE_MIDDLE_NAME_REGEX"}
                    regexID={"validMiddleNameRegex"}
                    descKeyLabel={"Middle Name Validation Description Key"}
                    descToolTipKey={"APP_DESIGNER_MIDDLE_NAME_DESCRIPTION_KEY"}
                    descID={"validMiddleNameDescriptionKey"}
                    propertyName={"validMiddleNameFormat"}
                  />
                </>
              )}
              <p />
              <AvniSwitch
                checked={!!subjectType.lastNameOptional}
                onChange={event =>
                  dispatch({
                    type: "lastNameOptional",
                    payload: event.target.checked
                  })
                }
                name="Last Name Optional"
                toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_LAST_NAME_OPTIONAL"}
              />
              <p />
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
            </>
          )}
          <p />
          <AvniFormLabel label={"Name help text"} toolTipKey={"APP_DESIGNER_NAME_HELP_TEXT"} />
          <Input
            multiline
            style={{ width: "100%" }}
            id={"nameHelpText"}
            value={get(subjectType, `nameHelpText`, "")}
            onChange={event => dispatch({ type: "nameHelpText", payload: event.target.value })}
          />
          {!isEmpty(subjectType.settings) && (
            <div>
              <AvniSwitch
                checked={!!subjectType.settings.displayRegistrationDetails}
                onChange={event =>
                  dispatch({
                    type: "settings",
                    payload: { setting: "displayRegistrationDetails", value: event.target.checked }
                  })
                }
                name="Display Registration Details"
                toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_DISPLAY_REGISTRATION_DETAILS"}
              />
              <AvniSwitch
                checked={!!subjectType.settings.displayPlannedEncounters}
                onChange={event =>
                  dispatch({
                    type: "settings",
                    payload: { setting: "displayPlannedEncounters", value: event.target.checked }
                  })
                }
                name="Display Planned Encounters"
                toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_DISPLAY_PLANNED_ENCOUNTERS"}
              />
            </div>
          )}
          <Box component={"div"} mt={3} mb={2} p={2} border={1} borderColor={"#e1e1e1"}>
            <Typography gutterBottom variant={"subtitle1"}>
              {"Sync Settings"}
            </Typography>
            {subjectType.type === SubjectTypeType.User ? (
              <Typography>Determined by Subject Type</Typography>
            ) : (
              <>
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
              </>
            )}
          </Box>
        </div>
      </CustomAccordianDetails>
    </CustomAccordion>
  );
};
