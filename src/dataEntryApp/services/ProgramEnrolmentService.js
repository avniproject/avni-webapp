import { ModelGeneral as General, ValidationResult } from "avni-models";
import moment from "moment";
import { isNil } from "lodash";

export default {
  validateEnrolmentDate(programEnrolment) {
    const ENROLMENT_DATE = "ENROLMENT_DATE";
    const failure = new ValidationResult(false, ENROLMENT_DATE);
    if (isNil(programEnrolment.enrolmentDateTime)) {
      failure.messageKey = "emptyValidationMessage";
    } else if (
      General.dateAIsBeforeB(
        programEnrolment.enrolmentDateTime,
        programEnrolment.individual.registrationDate
      )
    ) {
      failure.messageKey = "enrolmentDateBeforeRegistrationDate";
    } else if (General.dateIsAfterToday(programEnrolment.enrolmentDateTime)) {
      failure.messageKey = "enrolmentDateInFuture";
    } else if (!moment(programEnrolment.enrolmentDateTime).isValid()) {
      failure.messageKey = "invalidDateFormat";
    } else {
      return new ValidationResult(true, ENROLMENT_DATE, null);
    }
    return failure;
  },
  validateCancelDate(programEncounter) {
    const CANCEL_DATE_TIME = "CANCEL_DATE_TIME";
    const failure = new ValidationResult(false, CANCEL_DATE_TIME);
    if (isNil(programEncounter.cancelDateTime)) failure.messageKey = "emptyValidationMessage";
    else if (
      General.dateAIsBeforeB(
        programEncounter.cancelDateTime,
        programEncounter.programEnrolment.enrolmentDateTime
      ) ||
      General.dateAIsAfterB(
        programEncounter.cancelDateTime,
        programEncounter.programEnrolment.programExitDateTime
      )
    )
      failure.messageKey = "cancelDateNotInBetweenEnrolmentAndExitDate";
    else if (General.dateIsAfterToday(programEncounter.cancelDateTime))
      failure.messageKey = "cancelDateInFuture";
    else if (!moment(programEncounter.cancelDateTime).isValid())
      failure.messageKey = "invalidDateFormat";
    else return new ValidationResult(true, CANCEL_DATE_TIME, null);
    return failure;
  }
};
