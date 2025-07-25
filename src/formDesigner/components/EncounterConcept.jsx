import { useState } from "react";
import { Grid, MenuItem, FormHelperText } from "@mui/material";
import { AvniSelect } from "../../common/components/AvniSelect";
import { filter, find, get } from "lodash";
import { AvniTextField } from "../../common/components/AvniTextField";

export const EncounterConcept = props => {
  const [keyValues, setKeyValues] = useState(get(props, "keyValues", []));

  const getValueOfKey = keyToSearch =>
    get(find(keyValues, ({ key }) => key === keyToSearch), "value");
  const encounterTypeOptions = get(
    props.operationalModules,
    "encounterTypes",
    []
  );
  const encounterScopeOptions = [
    { name: "Within Subject", uuid: "Within Subject" }
  ];
  const selectedEncounterTypeUUID = getValueOfKey("encounterTypeUUID");

  const updateKey = (key, event, index) => {
    const otherKeyValues = filter(keyValues, kv => kv.key !== key);
    setKeyValues([...otherKeyValues, { key, value: event.target.value }]);
    props.inlineConcept
      ? props.updateKeyValues(
          props.groupIndex,
          key,
          event.target.value,
          props.index
        )
      : props.updateKeyValues(
          {
            key: key,
            value: event.target.value
          },
          index
        );
  };

  const KeyValue = ({
    options,
    keyOption,
    value,
    label,
    toolTip,
    errorKey,
    index
  }) => (
    <Grid
      style={{ marginTop: "10px" }}
      size={{
        xs: 12,
        sm: 12
      }}
    >
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
      {props.error[errorKey] && (
        <FormHelperText error>*Required</FormHelperText>
      )}
    </Grid>
  );

  return (
    <Grid
      container
      sx={{
        justifyContent: "flex-start"
      }}
    >
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
      <AvniTextField
        id="encounterIdentifier"
        label="Encounter Identifier"
        value={getValueOfKey("encounterIdentifier")}
        onChange={event => updateKey("encounterIdentifier", event, 2)}
        margin="normal"
        autoComplete="off"
        toolTipKey={"APP_DESIGNER_CONCEPT_ENCOUNTER_IDENTIFIER"}
      />
    </Grid>
  );
};
