import React, { useState } from "react";
import http from "common/utils/httpClient";
import Chip from "@material-ui/core/Chip";
import FormLabel from "@material-ui/core/FormLabel";
import { default as UUID } from "uuid";
import AutoSuggestForEntity from "./AutoSuggestForEntity";

function ProgramChips(props) {
  const programObject = {};
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  props.program.map(l => (programObject[l.uuid] = l));

  const temp = props.formMapping.filter(
    l => l.subjectTypeUUID === props.rowDetails.uuid && l.programUUID !== null
  );

  const removeDuplicate = [...new Set(temp.map(t => t.programUUID))];

  const onAddProgram = (flag, t) => {
    if (name.trim() !== "") {
      const data = {
        uuid: UUID.v4(),
        subjectTypeUUID: props.rowDetails.uuid,
        programUUID: ""
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
                .post("/emptyFormMapping", data)
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
        const progUUID = props.program.filter(l => l.name === t);
        data.programUUID = progUUID[0].uuid;
        http
          .post("/emptyFormMapping", data)
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
              size="small"
              label={programObject[prog].name}
              color="primary"
              key={index}
              // onDelete={()=> onRemoveProgram(index)}
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
