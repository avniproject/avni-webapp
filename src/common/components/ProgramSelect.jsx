import { AvniFormLabel } from "./AvniFormLabel";
import Select from "react-select";
import { useEffect, useState } from "react";
import { httpClient } from "../utils/httpClient";
import NamedSelectableEntities from "../model/NamedSelectableEntities";
import WebProgram from "../model/WebProgram";
import { Delete } from "@mui/icons-material";
import { IconButton } from "@mui/material";

export function ProgramSelect({
  isMulti,
  selectedSubjectTypes,
  selectedPrograms,
  onChange
}) {
  const [programs, setPrograms] = useState(
    NamedSelectableEntities.createEmpty()
  );

  useEffect(() => {
    const subjectTypeParam =
      selectedSubjectTypes.length > 0
        ? selectedSubjectTypes.map(x => `subjectType=${x.uuid}`)
        : "";
    httpClient.getData(`/web/program/v2?${subjectTypeParam}`).then(response => {
      setPrograms(
        NamedSelectableEntities.create(WebProgram.fromResources(response))
      );
    });
  }, [selectedSubjectTypes]);

  const options = programs.getOptions();
  if (options.length === 0) return null;
  return (
    <div style={{ width: 400 }}>
      <AvniFormLabel
        label={"Program"}
        position={"top"}
        style={{ fontSize: 12 }}
      />
      <div
        style={{ flexDirection: "row", display: "flex", alignItems: "center" }}
      >
        <div style={{ width: "300px", marginRight: 10 }}>
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
        {selectedPrograms.length > 0 && (
          <IconButton onClick={() => onChange([])} size="large">
            <Delete />
          </IconButton>
        )}
      </div>
    </div>
  );
}
