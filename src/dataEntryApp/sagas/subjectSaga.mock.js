import {
  AddressLevel,
  Concept,
  Gender,
  Individual,
  Observation,
  PrimitiveValue,
  ProgramEnrolment,
  Encounter,
  ProgramEncounter,
  SubjectType
} from "openchs-models";
import EntityFactory from "dataEntryApp/test/EntityFactory";

export default (observationValue, { isExit, isCancel }) => {
  const encounter = Encounter.create();
  const programEnrolment = ProgramEnrolment.createEmptyInstance();
  const programEncounter = ProgramEncounter.createEmptyInstance();
  let address = AddressLevel.create({
    uuid: "eea64e54-dd5b-41fb-91aa-c6b4f4490bea",
    title: "Boarding",
    level: 1,
    typeString: "Boarding"
  });
  let male = new Gender();
  male.name = "Male";
  let subject = Individual.newInstance(
    "f585d2f0-c148-460c-b7ac-d1d3923cf14c",
    "Ramesh",
    "Nair",
    new Date(2010, 1, 1),
    true,
    male,
    1,
    SubjectType.create("Individual", false, false, SubjectType.types.Person)
  );
  subject.lowestAddressLevel = address;
  programEnrolment.individual = subject;
  programEnrolment.enrolmentDateTime = new Date(2017, 0, 0, 5);
  let conceptA1 = EntityFactory.createConcept("a1", Concept.dataType.Numeric);
  let conceptA2 = EntityFactory.createConcept("a2", Concept.dataType.Numeric);
  const codedConceptA1 = EntityFactory.createConcept("coded question a1", Concept.dataType.Coded);
  EntityFactory.addCodedAnswers(codedConceptA1, ["coded answer 1", "coded answer 2"]);

  const observations = [];

  observations.push(Observation.create(conceptA1, JSON.stringify(new PrimitiveValue(observationValue, Concept.dataType.Numeric))));

  subject.observations = observations;
  encounter[isCancel ? "cancelObservations" : "observations"] = observations;
  programEncounter[isCancel ? "cancelObservations" : "observations"] = observations;
  programEnrolment[isExit ? "programExitObservations" : "observations"] = observations;

  const form = EntityFactory.createForm("foo");
  const formElementGroup1 = EntityFactory.createFormElementGroup("bar", 1, form);
  const formElement1 = EntityFactory.createFormElement("a1", false, conceptA1, 1, "", formElementGroup1);
  const formElement2 = EntityFactory.createFormElement("a2", false, conceptA2, 2, "", formElementGroup1);

  return {
    programEnrolment,
    formElement1,
    formElement2,
    formElementGroup1,
    subject,
    encounter,
    programEncounter
  };
};
