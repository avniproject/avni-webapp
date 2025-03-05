import React from "react";
import { FormElement } from "avni-models";
import AttendanceFormElement from "./AttendanceFormElement";
import SubjectFormElement from "./SubjectFormElement";

const LandingSubjectFormElement = props => {
  const displayAllGroupMembers = props.formElement.recordValueByKey(FormElement.keys.displayAllGroupMembers);
  return displayAllGroupMembers ? (
    <AttendanceFormElement displayAllGroupMembers={displayAllGroupMembers} {...props} />
  ) : (
    <SubjectFormElement {...props} />
  );
};

export default LandingSubjectFormElement;
