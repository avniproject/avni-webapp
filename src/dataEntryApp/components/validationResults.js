import _ from "lodash";
import ValidationResult from "./ValidationResult";

class ValidationResults {
  constructor(validationResults) {
    this.validationResults = validationResults ? _.flatten([validationResults]) : [];
  }

  addOrReplace(validationResult) {
    _.remove(
      this.validationResults,
      result => result === this.resultFor(validationResult.formIdentifier)
    );
    this.validationResults.push(validationResult);
  }

  hasValidationError() {
    return _.some(this.validationResults, result => !result.success);
  }

  hasNoValidationError() {
    return !this.hasValidationError();
  }

  resultFor(formIdentifier) {
    return _.find(this.validationResults, result => result.formIdentifier === formIdentifier);
  }

  clone() {
    const validationResultsClone = _.map(this.validationResults, result =>
      ValidationResult.clone(result)
    );
    return new ValidationResults(validationResultsClone);
  }
}

export default ValidationResults;
