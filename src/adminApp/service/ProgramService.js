import _ from "lodash";
import { validateRule } from "../../formDesigner/util";
import http from "../../common/utils/httpClient";

class ProgramService {
  static validateProgram(program, subjectType) {
    const errors = new Map();

    if (_.isEmpty(program.name)) errors.set("Name", "Empty");

    if (_.isEmpty(subjectType)) errors.set("SubjectType", "Empty");

    const { jsCode, validationError } = validateRule(
      program.enrolmentEligibilityCheckDeclarativeRule,
      holder => holder.generateEligibilityRule()
    );
    if (!_.isEmpty(validationError)) {
      errors.set("EnrolmentEligibilityCheckDeclarativeRule", validationError);
    }
    return [errors, jsCode];
  }

  static saveProgram(program, subjectType, programId) {
    const saveResponse = { errors: new Map() };
    const newProgram = _.isNil(programId) || programId === 0;
    const endpoint = "/web/program/" + (newProgram ? "" : programId);
    const serverCall = newProgram ? http.post : http.put;
    return serverCall(endpoint, {
      name: program.name,
      colour: program.colour === "" ? "#ff0000" : program.colour,
      programSubjectLabel: program.programSubjectLabel,
      enrolmentSummaryRule: program.enrolmentSummaryRule,
      subjectTypeUuid: subjectType.uuid,
      programEnrolmentFormUuid: _.get(program, "programEnrolmentForm.formUUID"),
      programExitFormUuid: _.get(program, "programExitForm.formUUID"),
      enrolmentEligibilityCheckRule: program.enrolmentEligibilityCheckRule,
      enrolmentEligibilityCheckDeclarativeRule: program.enrolmentEligibilityCheckDeclarativeRule,
      manualEligibilityCheckRequired: program.manualEligibilityCheckRequired,
      manualEnrolmentEligibilityCheckRule: program.manualEnrolmentEligibilityCheckRule,
      manualEnrolmentEligibilityCheckDeclarativeRule:
        program.manualEnrolmentEligibilityCheckDeclarativeRule
    })
      .then(response => {
        saveResponse.status = response.status;
        if (response.status === 200) {
          saveResponse.id = response.data.id;
        }
        return saveResponse;
      })
      .catch(error => {
        saveResponse.errors.set("SaveProgram", error.response.data.message);
        return saveResponse;
      });
  }
}

export default ProgramService;
