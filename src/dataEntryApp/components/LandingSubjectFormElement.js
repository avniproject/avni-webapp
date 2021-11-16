import React from "react";
import { FormElement } from "avni-models";
import AttendanceFormElement from "./AttendanceFormElement";
import SubjectFormElement from "./SubjectFormElement";

const LandingSubjectFormElement = props => {
  const isAttendance = props.formElement.recordByKey(FormElement.keys.isAttendance);
  return isAttendance ? <AttendanceFormElement {...props} /> : <SubjectFormElement {...props} />;
};

export default LandingSubjectFormElement;
