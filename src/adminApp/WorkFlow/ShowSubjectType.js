import React from "react";
import http from "common/utils/httpClient";
import { default as UUID } from "uuid";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";

function ShowSubjectType(props) {
  const existMapping = props.formMapping.filter(l => l.programUUID === props.rowDetails.uuid);

  const onAddSubjectMappingtoProgram = event => {
    const data = {
      uuid: UUID.v4(),
      subjectTypeUUID: event.target.value.uuid,
      programUUID: props.rowDetails.uuid,
      isVoided: false
    };

    http
      .post("/emptyFormMapping", [data])
      .then(response => {
        props.setMapping([...props.formMapping, data]);
      })
      .catch(error => {
        console.log(error.response.data.message);
      });
  };
  return (
    <>
      {existMapping.length === 0 && (
        <FormControl>
          <InputLabel id="demo-simple-select-label">Select subject type</InputLabel>
          <Select
            label="Select subject type"
            onChange={event => onAddSubjectMappingtoProgram(event)}
            style={{ width: "160px" }}
          >
            {props.subjectType.map(subject => {
              return (
                <MenuItem value={subject} key={subject.uuid}>
                  {subject.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      )}

      {existMapping.length !== 0 && (
        <span>
          {props.subjectType.filter(l => l.uuid === existMapping[0].subjectTypeUUID)[0].name}
        </span>
      )}
    </>
  );
}

export default React.memo(ShowSubjectType);
