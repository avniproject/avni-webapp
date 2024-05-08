import { AvniFormLabel } from "./AvniFormLabel";
import Select from "react-select";
import React, { useEffect, useState } from "react";
import _ from "lodash";
import httpClient from "../utils/httpClient";

function getSelectedValues(options, selectedEntities) {
  return _.intersectionWith(options, selectedEntities, (a, b) => {
    return a.value.uuid === b.uuid;
  });
}

export function SubjectTypeSelect({ isMulti }) {
  const [subjectTypes, setSubjectTypes] = useState([]);

  useEffect(() => {
    httpClient.getAllData("subjectType", "/web/subjectType").then(response => {
      setSubjectTypes(
        response.map(subjectType => {
          return { label: subjectType.name, value: subjectType };
        })
      );
    });
  }, []);

  return (
    <div style={{ width: 400 }}>
      <AvniFormLabel label={"Subject type"} position={"top"} />
      <Select
        isMulti={isMulti}
        placeholder={"Select subject type"}
        value={getSelectedValues()}
        options={subjectTypes}
        onChange={() => {}}
        maxMenuHeight={200}
      />
    </div>
  );
}
