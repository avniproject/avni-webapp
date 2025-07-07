import { AvniFormLabel } from "./AvniFormLabel";
import Select from "react-select";
import { useEffect, useState } from "react";
import { httpClient } from "../utils/httpClient";
import NamedSelectableEntities from "../model/NamedSelectableEntities";
import WebEncounterType from "../model/WebEncounterType";
import { Delete } from "@mui/icons-material";
import { IconButton } from "@mui/material";

export function EncounterTypeSelect({ isMulti, selectedSubjectTypes = [], selectedPrograms = [], selectedEncounterTypes = [], onChange }) {
  const [encounterTypes, setEncounterTypes] = useState(NamedSelectableEntities.createEmpty());

  useEffect(() => {
    const subjectTypeParam = selectedSubjectTypes.length > 0 ? selectedSubjectTypes.map(x => `subjectType=${x.uuid}`) : "";
    const programParam = selectedPrograms.length > 0 ? selectedPrograms.map(x => `program=${x.uuid}`) : "";
    httpClient.getData(`/web/encounterType/v2?${subjectTypeParam}&${programParam}`).then(response => {
      setEncounterTypes(NamedSelectableEntities.create(WebEncounterType.fromResources(response)));
    });
  }, [selectedSubjectTypes]);

  const options = encounterTypes.getOptions();
  if (options.length === 0) return null;
  return (
    <div style={{ width: 400 }}>
      <AvniFormLabel label={"Encounter type"} position={"top"} style={{ fontSize: 12 }} />
      <div style={{ flexDirection: "row", display: "flex", alignItems: "center" }}>
        <div style={{ width: "300px", marginRight: 10 }}>
          <Select
            isMulti={isMulti}
            placeholder={"Select encounter type"}
            value={encounterTypes.getSelectedValue(selectedEncounterTypes, isMulti)}
            options={options}
            onChange={e => {
              onChange(encounterTypes.toggle(selectedEncounterTypes, e.value, isMulti));
            }}
            maxMenuHeight={200}
          />
        </div>
        {selectedEncounterTypes.length > 0 && (
          <IconButton onClick={() => onChange([])} size="large">
            <Delete />
          </IconButton>
        )}
      </div>
    </div>
  );
}
