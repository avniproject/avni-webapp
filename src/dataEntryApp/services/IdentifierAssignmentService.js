import { filter, find, isNil, forEach } from "lodash";
import { Concept, FormElement, ObservationsHolder } from "openchs-models";

const getIdentifierByIdAndSource = (id, idSourceUuid, identifierAssignments) => {
  return identifierAssignments.find(
    identifierAssignment =>
      identifierAssignment.identifier === id &&
      identifierAssignment.identifierSource.uuid === idSourceUuid
  );
};

export default {
  addIdentifiersToObservations(form, observations, identifierAssignments) {
    if (!isNil(form)) {
      const observationHolder = new ObservationsHolder(observations);
      filter(form.getFormElementsOfType(Concept.dataType.Id), fe =>
        isNil(observationHolder.findObservation(fe.concept))
      ).forEach(fe => {
        const idSourceUuid = fe.recordValueByKey(FormElement.keys.IdSourceUUID);
        const identifierAssignment = find(
          identifierAssignments,
          assignment => assignment.identifierSource.uuid === idSourceUuid
        );
        if (!isNil(identifierAssignment)) {
          observationHolder.addOrUpdateObservation(fe.concept, {
            uuid: identifierAssignment.uuid,
            value: identifierAssignment.identifier
          });
        }
      });
    }
  },
  getIdentifierAssignmentUuids(form, observations, identifierAssignments) {
    const identifierAssignmentUuids = [];
    const observationsHolder = new ObservationsHolder(observations);

    forEach(form.getFormElementsOfType(Concept.dataType.Id), formElement => {
      let observation = observationsHolder.findObservation(formElement.concept);
      if (observation) {
        const id = observation.getValue();
        const idSourceUuid = formElement.recordValueByKey(FormElement.keys.IdSourceUUID);
        const identifierAssignment = getIdentifierByIdAndSource(
          id,
          idSourceUuid,
          identifierAssignments
        );

        if (!isNil(identifierAssignment)) {
          identifierAssignmentUuids.push(identifierAssignment.uuid);
        } else {
          console.error(`Identifier ${id} not found`);
        }
      }
    });
    return identifierAssignmentUuids;
  }
};
