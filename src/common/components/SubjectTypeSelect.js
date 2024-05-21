import { AvniFormLabel } from "./AvniFormLabel";
import Select from "react-select";
import React, { useEffect, useState } from "react";
import httpClient from "../utils/httpClient";
import NamedSelectableEntities from "../model/NamedSelectableEntities";
import WebSubjectType from "../model/WebSubjectType";

export function SubjectTypeSelect({ isMulti, onChange, selectedSubjectTypes = [] }) {
  const [subjectTypes, setSubjectTypes] = useState(NamedSelectableEntities.createEmpty());

  useEffect(() => {
    httpClient.getAllData("subjectType", "/web/subjectType").then(response => {
      const namedSelectableEntities = NamedSelectableEntities.create(WebSubjectType.fromResources(response), selectedSubjectTypes);
      setSubjectTypes(namedSelectableEntities);
    });
  }, []);

  const options = subjectTypes.getOptions();
  return (
    <div style={{ width: 400 }}>
      <AvniFormLabel label={"Subject type"} position={"top"} style={{ fontSize: 12 }} />
      <Select
        isMulti={isMulti}
        placeholder={"Select subject type"}
        value={subjectTypes.getSelectedValue(selectedSubjectTypes, isMulti)}
        options={options}
        onChange={e => {
          onChange(subjectTypes.toggle(selectedSubjectTypes, e.value, isMulti));
        }}
        maxMenuHeight={200}
      />
    </div>
  );
}
