import React from "react";
import Grid from "@material-ui/core/Grid";
import { AvniSelect } from "../../common/components/AvniSelect";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import { get, find, includes, forEach, isEmpty, filter } from "lodash";
import http from "../../common/utils/httpClient";

export const EncounterConcept = props => {
  const [encounterIdentifierOptions, setEncounterIdentifierOptions] = React.useState([]);
  const [keyValues, setKeyValues] = React.useState(get(props, "keyValues", []));

  const getValueOfKey = keyToSearch =>
    get(find(keyValues, ({ key }) => key === keyToSearch), "value");
  const formMappings = get(props.operationalModules, "formMappings", []);
  const encounterTypeOptions = get(props.operationalModules, "encounterTypes", []);
  const encounterScopeOptions = [{ name: "Within Subject", uuid: "Within Subject" }];
  const selectedEncounterTypeUUID = getValueOfKey("encounterTypeUUID");

  React.useEffect(() => {
    if (selectedEncounterTypeUUID && !isEmpty(formMappings)) {
      const formMapping = find(
        formMappings,
        ({ encounterTypeUUID, formType }) =>
          encounterTypeUUID === selectedEncounterTypeUUID &&
          includes(["Encounter", "ProgramEncounter"], formType)
      );
      http
        .fetchJson(`/web/form/${get(formMapping, "formUUID")}`)
        .then(res => res.json)
        .then(form => {
          const identifierOptions = [{ name: "Encounter date", uuid: "Encounter date" }];
          forEach(form.formElementGroups, feg => {
            forEach(feg.applicableFormElements, fe => {
              if (!fe.voided && !feg.voided) {
                identifierOptions.push(fe.concept);
              }
            });
          });
          setEncounterIdentifierOptions(identifierOptions);
        });
    }
  }, [selectedEncounterTypeUUID, formMappings]);

  const updateKey = (key, event, index) => {
    const otherKeyValues = filter(keyValues, kv => kv.key !== key);
    setKeyValues([...otherKeyValues, { key, value: event.target.value }]);
    props.inlineConcept
      ? props.updateKeyValues(props.groupIndex, key, event.target.value, props.index)
      : props.updateKeyValues(
          {
            key: key,
            value: event.target.value
          },
          index
        );
  };

  const KeyValue = ({ options, keyOption, value, label, toolTip, errorKey, index }) => (
    <Grid item xs={12} sm={12} style={{ marginTop: "10px" }}>
      <AvniSelect
        key={keyOption}
        style={{ width: "400px", height: 40, marginTop: 24 }}
        onChange={event => updateKey(keyOption, event, index)}
        options={options.map(({ uuid, name }) => (
          <MenuItem value={uuid} key={uuid}>
            {name}
          </MenuItem>
        ))}
        value={value}
        label={label}
        toolTipKey={toolTip}
      />
      {props.error[errorKey] && <FormHelperText error>*Required</FormHelperText>}
    </Grid>
  );

  return (
    <Grid container justify="flex-start">
      <KeyValue
        options={encounterTypeOptions}
        keyOption={"encounterTypeUUID"}
        label={"Encounter Type"}
        value={selectedEncounterTypeUUID}
        toolTip={"APP_DESIGNER_CONCEPT_ENCOUNTER_TYPE"}
        errorKey={"encounterTypeRequired"}
        index={0}
      />
      <KeyValue
        options={encounterScopeOptions}
        keyOption={"encounterScope"}
        label={"Encounter Scope"}
        value={getValueOfKey("encounterScope")}
        toolTip={"APP_DESIGNER_CONCEPT_ENCOUNTER_SCOPE"}
        errorKey={"encounterScopeRequired"}
        index={1}
      />
      <KeyValue
        options={encounterIdentifierOptions}
        keyOption={"encounterIdentifier"}
        label={"Encounter Identifier"}
        value={getValueOfKey("encounterIdentifier")}
        toolTip={"APP_DESIGNER_CONCEPT_ENCOUNTER_IDENTIFIER"}
        errorKey={"encounterIdentifierRequired"}
        index={2}
      />
    </Grid>
  );
};
