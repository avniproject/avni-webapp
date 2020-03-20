import React, { useState } from "react";
import http from "common/utils/httpClient";
import Chip from "@material-ui/core/Chip";
import FormLabel from "@material-ui/core/FormLabel";
import { default as UUID } from "uuid";
import AutoSuggestForEntity from "./AutoSuggestForEntity";
import { cloneDeep } from "lodash";

function ProgramChips(props) {
  const programObject = {};
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  props.program.map(l => (programObject[l.uuid] = l));

  const temp = props.formMapping.filter(
    l =>
      l.subjectTypeUUID === props.rowDetails.uuid && l.programUUID !== null && l.isVoided === false
  );

  const removeDuplicate = [...new Set(temp.map(t => t.programUUID))];

  const onRemoveProgram = (progUUID, subUUID) => {
    const formMappingCopy = cloneDeep(props.formMapping);
    const voidMapping = formMappingCopy.filter(
      l => l.subjectTypeUUID === subUUID && l.programUUID === progUUID
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

  const onAddProgram = (flag, programName) => {
    if (name.trim() !== "") {
      const data = {
        uuid: UUID.v4(),
        subjectTypeUUID: props.rowDetails.uuid,
        programUUID: "",
        isVoided: false
        // formType:""
      };
      if (flag) {
        http
          .post("/web/program", {
            name: name
          })
          .then(response => {
            if (response.status === 200) {
              setError("");
              props.setProgram([...props.program, response.data]);
              data.programUUID = response.data.uuid;
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
        const progUUID = props.program.filter(l => l.name === programName);
        data.programUUID = progUUID[0].uuid;
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
      {removeDuplicate.map((prog, index) => {
        return (
          programObject[prog] && (
            <Chip
              size="medium"
              style={{ marginRight: "3px", marginTop: "2px" }}
              label={programObject[prog].name}
              color="primary"
              key={index}
              onDelete={() => onRemoveProgram(programObject[prog].uuid, props.rowDetails.uuid)}
            />
          )
        );
      })}
      <p />
      <AutoSuggestForEntity
        entity={props.program}
        removeDuplicate={removeDuplicate}
        name={name}
        setName={setName}
        onAdd={onAddProgram}
        placeholder="Enter program name"
        buttonName="Create program"
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

export default React.memo(ProgramChips);
