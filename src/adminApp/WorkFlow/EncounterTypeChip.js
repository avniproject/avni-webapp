import React, { useState } from "react";
import http from "common/utils/httpClient";
import Chip from "@material-ui/core/Chip";
import FormLabel from "@material-ui/core/FormLabel";
import { default as UUID } from "uuid";
import AutoSuggestForEntity from "./AutoSuggestForEntity";
import { cloneDeep } from "lodash";

function EncounterTypeChips(props) {
  const encounterTypeObject = {};
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  props.encounterType.map(l => (encounterTypeObject[l.uuid] = l));

  const temp = props.formMapping.filter(
    l =>
      l.subjectTypeUUID === props.rowDetails.uuid &&
      l.encounterTypeUUID !== null &&
      l.isVoided !== true
  );

  const removeDuplicate = [...new Set(temp.map(t => t.encounterTypeUUID))];

  const onRemoveEncounterType = (encounterUUID, subUUID) => {
    const formMappingCopy = cloneDeep(props.formMapping);
    const voidMapping = formMappingCopy.filter(
      l => l.subjectTypeUUID === subUUID && l.encounterTypeUUID === encounterUUID
    );
    voidMapping.map(l => (l.isVoided = true));
    http
      .post("/emptyFormMapping", voidMapping)
      .then(response => {
        if (response.status === 200) {
          props.setMapping(formMappingCopy);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const onAddEncounterType = (flag, encounterName) => {
    if (name.trim() !== "") {
      const data = {
        uuid: UUID.v4(),
        subjectTypeUUID: props.rowDetails.uuid,
        encounterTypeUUID: "",
        isVoided: false
      };
      if (flag) {
        http
          .post("/web/encounterType", {
            name: name
          })
          .then(response => {
            if (response.status === 200) {
              setError("");
              props.setEncounterType([...props.encounterType, response.data]);
              data.encounterTypeUUID = response.data.uuid;
              http
                .post("/emptyFormMapping", [data])
                .then(response => {
                  props.setMapping([...props.formMapping, data]);
                })
                .catch(error => {
                  console.log(error.response.data.message);
                });
            }
          })
          .catch(error => {
            setError(error.response.data.message);
          });
      }
      if (!flag) {
        const encounterUUID = props.encounterType.filter(l => l.name === encounterName);
        data.encounterTypeUUID = encounterUUID[0].uuid;
        http
          .post("/emptyFormMapping", [data])
          .then(response => {
            props.setMapping([...props.formMapping, data]);
          })
          .catch(error => {
            console.log(error.response.data.message);
          });
      }

      setError("");
      setName("");
    } else {
      setError("Please enter program name");
    }
  };

  return (
    <>
      {removeDuplicate.map((encounter, index) => {
        return (
          encounterTypeObject[encounter] && (
            <Chip
              size="small"
              label={encounterTypeObject[encounter].name}
              color="primary"
              key={index}
              onDelete={() =>
                onRemoveEncounterType(encounterTypeObject[encounter].uuid, props.rowDetails.uuid)
              }
            />
          )
        );
      })}
      <p />
      <AutoSuggestForEntity
        entity={props.encounterType}
        removeDuplicate={removeDuplicate}
        name={name}
        setName={setName}
        onAdd={onAddEncounterType}
        placeholder="Enter encounter type name"
        buttonName="Create encounter type"
      />

      <p />
      {error !== "" && (
        <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
          {error}
        </FormLabel>
      )}
    </>
  );
}

export default React.memo(EncounterTypeChips);
