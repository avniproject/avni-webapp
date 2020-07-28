import { ModelGeneral as General, ValidationResult } from "avni-models";
import moment from "moment";
import { isNil } from "lodash";

export default {
  validateVisitDate(programEncounter) {
    const ENCOUNTER_DATE_TIME = "ENCOUNTER_DATE_TIME";
    const failure = new ValidationResult(false, ENCOUNTER_DATE_TIME);
    if (isNil(programEncounter.encounterDateTime)) {
      failure.messageKey = "emptyValidationMessage";
    } else if (
      General.dateAIsBeforeB(
        programEncounter.encounterDateTime,
        programEncounter.programEnrolment.enrolmentDateTime
      ) ||
      General.dateAIsAfterB(
        programEncounter.encounterDateTime,
        programEncounter.programEnrolment.programExitDateTime
      )
    ) {
      failure.messageKey = "encounterDateNotInBetweenEnrolmentAndExitDate";
    } else if (General.dateIsAfterToday(programEncounter.encounterDateTime)) {
      failure.messageKey = "encounterDateInFuture";
    } else if (!moment(programEncounter.encounterDateTime).isValid()) {
      failure.messageKey = "invalidDateFormat";
    } else {
      return new ValidationResult(true, ENCOUNTER_DATE_TIME, null);
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
