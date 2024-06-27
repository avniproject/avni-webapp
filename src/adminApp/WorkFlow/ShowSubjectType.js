import React from "react";
import RemoveIcon from "@material-ui/icons/Remove";

export const ShowSubjectType = props => {
  const existMapping = props.formMapping.filter(l => l[props.entityUUID] === props.rowDetails.uuid);

  const subjectType = existMapping.length !== 0 ? props.subjectType.filter(l => l.uuid === existMapping[0].subjectTypeUUID) : [];

  return (
    <>
      {existMapping.length !== 0 && subjectType.length !== 0 && (
        <span>{props.subjectType.filter(l => l.uuid === existMapping[0].subjectTypeUUID)[0].name}</span>
      )}
    </>
  );
};

export const ShowPrograms = props => {
  const existMapping = props.formMapping.filter(l => l.encounterTypeUUID === props.rowDetails.uuid);
  const program = existMapping.length !== 0 ? props.program.filter(l => l.uuid === existMapping[0].programUUID) : [];

  return (
    <>
      {existMapping.length !== 0 && program.length !== 0 && <span>{program[0].operationalProgramName || program[0].name}</span>}
      {(existMapping.length === 0 || program.length === 0) && <RemoveIcon />}
    </>
  );
};
