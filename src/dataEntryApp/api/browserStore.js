import { Individual, ObservationsHolder, Observation, Concept } from "avni-models";
import { store } from "../../common/store/createStore";
import { types } from "../../common/store/conceptReducer";
export default class {
  static fetchSubject() {
    if (sessionStorage.getItem("subject")) {
      let subject = Individual.createEmptyInstance();
      let localSavedSubject = JSON.parse(sessionStorage.getItem("subject"));

      subject.name = localSavedSubject.name;
      subject.firstName = localSavedSubject.firstName;
      subject.lastName = localSavedSubject.lastName;
      subject.dateOfBirth = new Date(localSavedSubject.dateOfBirth);
      subject.registrationDate = new Date(localSavedSubject.registrationDate);
      subject.dateOfBirthVerified = localSavedSubject.dateOfBirthVerified;
      subject.gender.name = localSavedSubject.gender.name;
      subject.gender.uuid = localSavedSubject.gender.uuid;
      subject.lowestAddressLevel = localSavedSubject.lowestAddressLevel;
      subject.registrationLocation = localSavedSubject.registrationLocation;
      subject.relationship = localSavedSubject.relationship;
      subject.subjectType.name = localSavedSubject.subjectType.name;
      subject.subjectType.uuid = localSavedSubject.subjectType.uuid;

      //addOrUpdateObservation
      const observationHolder = new ObservationsHolder(subject.observations);
      localSavedSubject.observations.map(element => {
        let concept = Concept.create(
          element.concept.name,
          element.concept.datatype,
          element.concept.keyValues,
          element.concept.uuid
        );
        observationHolder.addOrUpdateObservation(concept, element.valueJSON.answer);
        store.dispatch({ type: types.ADD_CONCEPT, value: concept });
      });
      subject.observations = observationHolder.observations;
      return subject;
    } else return;
  }

  static clear(key) {
    if (sessionStorage.getItem(key)) {
      sessionStorage.clear(key);
    }
  }
}
