import { AvniFormLabel } from "./AvniFormLabel";
import Select from "react-select";
import { useEffect, useState } from "react";
import { httpClient } from "../utils/httpClient";
import NamedSelectableEntities from "../model/NamedSelectableEntities";
import WebSubjectType from "../model/WebSubjectType";
import { Delete } from "@mui/icons-material";
import { IconButton } from "@mui/material";

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
    <div>
      <AvniFormLabel label={"Subject type"} position={"top"} style={{ fontSize: 12 }} />
      <div style={{ flexDirection: "row", display: "flex", alignItems: "center" }}>
        <div style={{ width: "300px", marginRight: 10 }}>
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
        <IconButton onClick={() => onChange([])} size="large">
          <Delete />
        </IconButton>
      </div>
    </div>
  );
}
