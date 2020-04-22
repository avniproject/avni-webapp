import {
  Individual,
  ObservationsHolder,
  Observation,
  Concept,
  Gender,
  AddressLevel,
  SubjectType
} from "avni-models";
import { store } from "../../common/store/createStore";
import { types } from "../../common/store/conceptReducer";
export default class {
  static fetchSubject() {
    if (sessionStorage.getItem("subject")) {
      let subject = Individual.createEmptyInstance();
      let localSavedSubject = JSON.parse(sessionStorage.getItem("subject"));
      // if (subject.uuid) {
      //   subject.uuid = localSavedSubject.uuid;
      // }
      subject.name = localSavedSubject.name;
      subject.firstName = localSavedSubject.firstName;
      subject.lastName = localSavedSubject.lastName;
      subject.dateOfBirth = localSavedSubject.dateOfBirth;
      subject.registrationDate = localSavedSubject.registrationDate;
      subject.dateOfBirthVerified = localSavedSubject.dateOfBirthVerified;
      subject.registrationLocation = localSavedSubject.registrationLocation;
      subject.relationship = localSavedSubject.relationship;

      const gender = new Gender();
      gender.name = localSavedSubject.gender.name;
      gender.uuid = localSavedSubject.gender.uuid;
      subject.gender = gender;

      const subjectType = new SubjectType();
      subjectType.uuid = localSavedSubject.subjectType.uuid;
      subjectType.name = localSavedSubject.subjectType.name;
      subject.subjectType = subjectType;

      const addressLevel = new AddressLevel();
      subject.uuid = localSavedSubject.lowestAddressLevel.uuid;
      subject.name = localSavedSubject.lowestAddressLevel.name;
      subject.lowestAddressLevel = addressLevel;

      //addOrUpdateObservation
      const observationHolder = new ObservationsHolder(subject.observations);
      localSavedSubject.observations.map(element => {
        let concept = Concept.create(
          element.concept.name,
          element.concept.datatype,
          element.concept.keyValues,
          element.concept.uuid
        );
        observationHolder.addOrUpdateObservation(
          concept,
          concept.isDurationConcept() ? element.valueJSON : element.valueJSON.answer
        );
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
