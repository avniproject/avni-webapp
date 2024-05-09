import { AvniFormLabel } from "./AvniFormLabel";
import Select from "react-select";
import React, { useEffect, useState } from "react";
import _ from "lodash";
import httpClient from "../utils/httpClient";

function getSelectedValue(options, selectedEntities, isMulti) {
  const selected = _.intersectionWith(options, selectedEntities, (a, b) => {
    return a.value.uuid === b.uuid;
  });
  if (isMulti) {
    return selected.length === 1 ? selected[0] : null;
  }
  return selected;
}

function getSelected(selectedValue, isMulti) {
  return isMulti ? selectedValue : selectedValue[0];
}

export function SubjectTypeSelect({ isMulti }) {
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [selectedSubjectTypes, setSelectedSubjectTypes] = useState(isMulti ? [] : null);

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
        value={getSelectedValue(subjectTypes, selectedSubjectTypes, isMulti)}
        options={subjectTypes}
        onChange={e => setSelectedSubjectTypes(getSelected(e.value, isMulti))}
        maxMenuHeight={200}
      />
    </div>
  );
}
