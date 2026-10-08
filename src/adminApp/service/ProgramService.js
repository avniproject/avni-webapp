import _ from "lodash";
import { validateRule } from "../../formDesigner/util";
import { httpClient as http } from "../../common/utils/httpClient";

class ProgramService {
  static validateProgram(program, subjectType) {
    const errors = new Map();

    if (_.isEmpty(program.name)) errors.set("Name", "Empty");

    if (_.isNil(subjectType)) errors.set("SubjectType", "Empty");

    const { jsCodeEECDR, validationErrorEECDR } = validateRule(program.enrolmentEligibilityCheckDeclarativeRule, holder =>
      holder.generateEligibilityRule()
    );
    if (!_.isEmpty(validationErrorEECDR)) {
      errors.set("EnrolmentEligibilityCheckDeclarativeRule", validationErrorEECDR);
    }

    const { jsCodeMEECDR, validationErrorMEECDR } = validateRule(program.manualEnrolmentEligibilityCheckDeclarativeRule, holder =>
      holder.generateEligibilityRule()
    );
    if (!_.isEmpty(validationErrorMEECDR)) {
      errors.set("ManualEnrolmentEligibilityCheckDeclarativeRule", validationErrorMEECDR);
    }
    return [errors, jsCodeEECDR, jsCodeMEECDR];
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
      showGrowthChart: program.showGrowthChart,
      allowMultipleEnrolments: program.allowMultipleEnrolments,
      manualEnrolmentEligibilityCheckRule: program.manualEnrolmentEligibilityCheckRule,
      programId: program.programId,
      manualEnrolmentEligibilityCheckDeclarativeRule: program.manualEnrolmentEligibilityCheckDeclarativeRule
    })
      .then(response => {
        saveResponse.status = response.status;
        if (response.status === 200) {
          saveResponse.id = response.data.id;
          saveResponse.programId = response.data.programId;
        }
        return saveResponse;
      })
      .catch(error => {
        saveResponse.errors.set("SaveProgram", error.response.data.message);
        return saveResponse;
      });
  }

  static updateJSRules(program, errors, jsCodeEECDR, jsCodeMEECDR) {
    if (!_.isEmpty(jsCodeEECDR) && _.isNil(errors.get("EnrolmentEligibilityCheckDeclarativeRule"))) {
      program.enrolmentEligibilityCheckRule = jsCodeEECDR;
    }
    if (!_.isEmpty(jsCodeMEECDR) && _.isNil(errors.get("ManualEnrolmentEligibilityCheckDeclarativeRule"))) {
      program.manenrolmentEligibilityCheckRule = jsCodeMEECDR;
    }
  }
}

export default ProgramService;
