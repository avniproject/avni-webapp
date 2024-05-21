import { AvniFormLabel } from "./AvniFormLabel";
import Select from "react-select";
import React, { useEffect, useState } from "react";
import httpClient from "../utils/httpClient";
import NamedSelectableEntities from "../model/NamedSelectableEntities";
import WebProgram from "../model/WebProgram";

export function ProgramSelect({ isMulti, selectedSubjectTypes, selectedPrograms, onChange }) {
  const [programs, setPrograms] = useState(NamedSelectableEntities.createEmpty());

  useEffect(() => {
    const subjectTypeParam = selectedSubjectTypes.length > 0 ? selectedSubjectTypes.map(x => `subjectType=${x.uuid}`) : "";
    httpClient.getData(`/web/program/v2?${subjectTypeParam}`).then(response => {
      setPrograms(NamedSelectableEntities.create(WebProgram.fromResources(response)));
    });
  }, [selectedSubjectTypes]);

  const options = programs.getOptions();
  return (
    <div style={{ width: 400 }}>
      <AvniFormLabel label={"Program"} position={"top"} style={{ fontSize: 12 }} />
      <Select
        isMulti={isMulti}
        placeholder={"Select program"}
        value={programs.getSelectedValue(selectedPrograms, isMulti)}
        options={options}
        onChange={e => {
          onChange(programs.toggle(selectedPrograms, e.value, isMulti));
        }}
        maxMenuHeight={200}
      />
    </div>
  );
}
