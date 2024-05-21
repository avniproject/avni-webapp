import { SubjectTypeSelect } from "./SubjectTypeSelect";
import React from "react";
import { ProgramSelect } from "./ProgramSelect";
import { EncounterTypeSelect } from "./EncounterTypeSelect";

export default function({ isMulti = false, selectedSubjectTypes = [], selectedPrograms = [], selectedEncounterTypes = [], onChange }) {
  return (
    <>
      <SubjectTypeSelect
        isMulti={isMulti}
        selectedSubjectTypes={selectedSubjectTypes}
        onChange={x => onChange({ subjectTypes: x, programs: [], encounterTypes: [] })}
      />
      <br />
      <ProgramSelect
        isMulti={isMulti}
        selectedSubjectTypes={selectedSubjectTypes}
        selectedPrograms={selectedPrograms}
        onChange={x => onChange({ subjectTypes: selectedSubjectTypes, programs: x, encounterTypes: [] })}
      />
      <br />
      <EncounterTypeSelect
        isMulti={isMulti}
        selectedSubjectTypes={selectedSubjectTypes}
        selectedPrograms={selectedPrograms}
        selectedEncounterTypes={selectedEncounterTypes}
        onChange={x =>
          onChange({
            subjectTypes: selectedSubjectTypes,
            programs: selectedPrograms,
            encounterTypes: x
          })
        }
      />
    </>
  );
}
