import { Fragment } from "react";
import { isEmpty } from "lodash";
import { ExportOptions } from "./ExportOptions";
import { DateOptions } from "./DateOptions";

export const EnrolmentType = ({
  subjectTypes,
  subjectType,
  startDate,
  endDate,
  dispatch,
  setEnableExport,
  programOptions,
  program
}) => {
  const onProgramChange = program => {
    dispatch("program", program);
    !isEmpty(subjectType) && !isEmpty(program)
      ? setEnableExport(true)
      : setEnableExport(false);
  };

  return (
    <Fragment>
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
        onChange={program => onProgramChange(program)}
      />
      <DateOptions
        dispatch={dispatch}
        endDate={endDate}
        startDate={startDate}
        startDateLabel={"Enrolment start date"}
        endDateLabel={"Enrolment end date"}
      />
    </Fragment>
  );
};
