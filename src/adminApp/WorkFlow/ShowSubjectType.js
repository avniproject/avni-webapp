import React from "react";
import _ from "lodash";

function ShowSubjectType(props) {
  const existMapping = props.flag
    ? []
    : props.formMapping.filter(l => l.programUUID === props.rowDetails.uuid);

  const subjectType =
    existMapping.length !== 0
      ? props.subjectType.filter(l => l.uuid === existMapping[0].subjectTypeUUID)
      : [];

  return (
    <>
      {existMapping.length !== 0 && subjectType.length !== 0 && (
        <span>
          {props.subjectType.filter(l => l.uuid === existMapping[0].subjectTypeUUID)[0].name}
        </span>
      )}
    </>
  );
}

export default React.memo(ShowSubjectType);
