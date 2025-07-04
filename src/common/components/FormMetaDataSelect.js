import { SubjectTypeSelect } from "./SubjectTypeSelect";

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
      <p />
      {selectedSubjectTypes.length > 0 && (
        <>
          <ProgramSelect
            isMulti={isMulti}
            selectedSubjectTypes={selectedSubjectTypes}
            selectedPrograms={selectedPrograms}
            onChange={x => onChange({ subjectTypes: selectedSubjectTypes, programs: x, encounterTypes: [] })}
          />
          <p />
        </>
      )}
      {selectedSubjectTypes.length > 0 && (
        <>
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
      )}
    </>
  );
}
