import React from "react";
import { ExportOptions } from "./ExportOptions";
import { DateOptions } from "./DateOptions";

export const RegistrationType = ({
  subjectTypes,
  subjectType,
  startDate,
  endDate,
  dispatch,
  setEnableExport
}) => {
  const onSubjectTypeChange = st => {
    dispatch("subjectType", st);
    setEnableExport(true);
  };

  return (
    <React.Fragment>
      <ExportOptions
        options={subjectTypes}
        label={"Subject Type"}
        selectedOption={subjectType}
        onChange={st => onSubjectTypeChange(st)}
      />
      <DateOptions
        dispatch={dispatch}
        endDate={endDate}
        startDate={startDate}
        startDateLabel={"Registration start date"}
        endDateLabel={"Registration end date"}
      />
    </React.Fragment>
  );
};
