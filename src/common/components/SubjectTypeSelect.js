import { AvniFormLabel } from "./AvniFormLabel";
import Select from "react-select";
import React, { useEffect, useState } from "react";
import httpClient from "../utils/httpClient";
import NamedEntities from "../model/NamedEntities";

export function SubjectTypeSelect({ isMulti }) {
  const [subjectTypes, setSubjectTypes] = useState(NamedEntities.createEmpty());

  useEffect(() => {
    httpClient.getAllData("subjectType", "/web/subjectType").then(response => {
      setSubjectTypes(NamedEntities.fromResources(response));
    });
  }, []);

  const options = subjectTypes.getOptions();
  return (
    <div style={{ width: 400 }}>
      <AvniFormLabel label={"Subject type"} position={"top"} />
      <Select
        isMulti={isMulti}
        placeholder={"Select subject type"}
        value={subjectTypes.getSelected(isMulti)}
        options={options}
        onChange={e => {
          subjectTypes.toggle(e.value, isMulti);
          setSubjectTypes(subjectTypes.clone());
        }}
        maxMenuHeight={200}
      />
    </div>
  );
}
