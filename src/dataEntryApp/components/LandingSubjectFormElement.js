import React from "react";
import { FormElement } from "avni-models";
import AttendanceFormElement from "./AttendanceFormElement";
import SubjectFormElement from "./SubjectFormElement";

const LandingSubjectFormElement = props => {
  const displayAllGroupMembers = props.formElement.recordValueByKey(
    FormElement.keys.displayAllGroupMembers
  );
  const searchOptions = props.formElement.recordValueByKey(FormElement.keys.searchOptions);
  return searchOptions ? (
    <SubjectFormElement {...props} />
  ) : (
    <AttendanceFormElement displayAllGroupMembers={displayAllGroupMembers} {...props} />
  );
};

export default LandingSubjectFormElement;
