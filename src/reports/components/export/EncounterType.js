import React from "react";
import { isEmpty } from "lodash";
import { ExportOptions } from "./ExportOptions";
import { DateOptions } from "./DateOptions";

export const EncounterType = ({
  subjectTypes,
  subjectType,
  startDate,
  endDate,
  dispatch,
  setEnableExport,
  programOptions,
  program,
  encounterTypeOptions,
  encounterType
}) => {
  const onEncounterTypeChange = et => {
    dispatch("encounterType", et);
    !isEmpty(subjectType) && !isEmpty(et) ? setEnableExport(true) : setEnableExport(false);
  };

  return (
    <React.Fragment>
      <ExportOptions
        options={subjectTypes}
        label={"Subject Type"}
        selectedOption={subjectType}
        onChange={st => dispatch("subjectType", st)}
      />
      <ExportOptions
        options={programOptions}
        label={"Program"}
        selectedOption={program}
        onChange={program => dispatch("program", program)}
      />
      <ExportOptions
        options={encounterTypeOptions}
        label={"Encounter Type"}
        selectedOption={encounterType}
        onChange={et => onEncounterTypeChange(et)}
      />
      <DateOptions
        dispatch={dispatch}
        endDate={endDate}
        startDate={startDate}
        startDateLabel={"Visit start date"}
        endDateLabel={"Visit end date"}
      />
    </React.Fragment>
  );
};
