import _ from "lodash";
import { Duration } from "openchs-models";
import moment from "moment";

export const getDisplayAge = (dob, i18n) => {
  const ageInYears = moment().diff(dob, "years");
  if (ageInYears < 1) {
    let ageInWeeks = moment().diff(dob, "weeks");
    return ageInWeeks === 0
      ? Duration.inDay(moment().diff(dob, "days")).toString(i18n)
      : Duration.inWeek(ageInWeeks).toString(i18n);
  } else if (ageInYears < 2) {
    return Duration.inMonth(moment().diff(dob, "months")).toString(i18n);
  } else if (ageInYears < 6) {
    let ageInMonths = moment().diff(dob, "months");
    let noOfYears = _.toInteger(ageInMonths / 12);
    let noOfMonths = ageInMonths % 12;
    let durationInYears = `${Duration.inYear(noOfYears).toString(i18n)}`;
    if (noOfMonths > 0) return `${durationInYears} ${Duration.inMonth(noOfMonths).toString(i18n)}`;
    return durationInYears;
  } else {
    return Duration.inYear(ageInYears).toString(i18n);
  }
};
