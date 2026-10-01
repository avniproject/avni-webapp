import { filter, flatMap, isEmpty, isNil } from "lodash";
import { isConceptHidden } from "../../formDesigner/util/HiddenConceptUtil";

// A value recorded against a hidden concept is never drawn in the data entry app, as on the phone.
// See avniproject/avni-product#1905.
const isHiddenObservation = (observation) => isConceptHidden(observation.concept);

export const visibleGroupObservations = (groupObservations) =>
  filter(groupObservations, (observation) => !isHiddenObservation(observation));

const questionGroupAnswers = (observation) => {
  const valueWrapper = observation.getValueWrapper();
  if (isNil(valueWrapper)) return [];
  const questionGroups = "repeatableObservations" in valueWrapper ? valueWrapper.repeatableObservations : [valueWrapper];
  return flatMap(questionGroups, (questionGroup) => questionGroup.getValue());
};

// A question group whose every answer is hidden goes too, so it cannot draw as an empty table.
const hidesEveryAnswer = (observation) => {
  const answers = questionGroupAnswers(observation);
  return !isEmpty(answers) && isEmpty(visibleGroupObservations(answers));
};

export const visibleObservations = (observations) =>
  filter(
    observations,
    (observation) => !isHiddenObservation(observation) && !(observation.concept.isQuestionGroup() && hidesEveryAnswer(observation)),
  );
