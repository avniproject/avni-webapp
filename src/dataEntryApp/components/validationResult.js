import _ from "lodash";
//import BaseEntity from '../BaseEntity';

class ValidationResult {
  constructor(success, formIdentifier, messageKey, extra) {
    this.success = success;
    this.formIdentifier = formIdentifier;
    this.messageKey = messageKey;
    this.extra = extra;
  }

  static successful(formIdentifier) {
    return new ValidationResult(true, formIdentifier);
  }

  static failureForEmpty(formIdentifier) {
    return new ValidationResult(false, formIdentifier, "emptyValidationMessage");
  }

  static failureForNumeric(formIdentifier) {
    return new ValidationResult(false, formIdentifier, "numericValueValidation");
  }

  static failure(formIdentifier, messageKey, extra) {
    return new ValidationResult(false, formIdentifier, messageKey, extra);
  }

  //static because validation result could be created by the rules which would not be using this class
  // static clone(validationResult) {
  //     return new ValidationResult(validationResult.success, validationResult.formIdentifier, validationResult.messageKey, validationResult.extra);
  // }
  //
  // static findByFormIdentifier(validationResults, formIdentifier) {
  //     return _.find(validationResults, (validationResult) => validationResult.formIdentifier === formIdentifier);
  // }
  //
  // static hasValidationError(validationResults) {
  //     return validationResults.some((validationResult) => !validationResult.success);
  // }
  //
  // static hasNonRuleValidationError(validationResults) {
  //     return validationResults.some((validationResult) => !validationResult.success && validationResult.formIdentifier !== BaseEntity.fieldKeys.EXTERNAL_RULE);
  // }
}

export default ValidationResult;
