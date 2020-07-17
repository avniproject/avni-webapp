import { ObservationsHolder, Concept } from "avni-models";
import { isNil, remove } from "lodash";

export default {
  updateObservations(observations, formElement, value) {
    const observationHolder = new ObservationsHolder(observations);
    if (formElement.concept.datatype === Concept.dataType.Coded && formElement.isMultiSelect()) {
      const answer = observationHolder.toggleMultiSelectAnswer(formElement.concept, value);
    } else if (
      formElement.concept.datatype === Concept.dataType.Coded &&
      formElement.isSingleSelect()
    ) {
      observationHolder.toggleSingleSelectAnswer(formElement.concept, value);
    } else if (
      formElement.concept.datatype === Concept.dataType.Duration &&
      !isNil(formElement.durationOptions)
    ) {
      observationHolder.updateCompositeDurationValue(formElement.concept, value);
    } else if (
      formElement.concept.datatype === Concept.dataType.Date &&
      !isNil(formElement.durationOptions)
    ) {
      observationHolder.addOrUpdatePrimitiveObs(formElement.concept, value);
    } else {
      observationHolder.addOrUpdatePrimitiveObs(formElement.concept, value);
    }
    return observationHolder.observations;
  },

  validate(formElement, value, observations, validationResults) {
    let isNullForMultiselect = false;
    if (formElement.concept.datatype === Concept.dataType.Coded && formElement.isMultiSelect()) {
      const observationHolder = new ObservationsHolder(observations);
      const answers =
        observationHolder.findObservation(formElement.concept) &&
        observationHolder.findObservation(formElement.concept).getValue();

      isNullForMultiselect = isNil(answers);
    }

    const validationResult = formElement.validate(isNullForMultiselect ? null : value);

    remove(
      validationResults,
      existingValidationResult =>
        existingValidationResult.formIdentifier === validationResult.formIdentifier
    );

    validationResults.push(validationResult);
    return validationResults;
  }
};
