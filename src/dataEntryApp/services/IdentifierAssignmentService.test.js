import identifierAssignmentService from "./IdentifierAssignmentService";
import EntityFactory from "dataEntryApp/test/EntityFactory";
import { Concept, KeyValue, FormElement } from "openchs-models";

const findObsByConceptName = (observations, conceptName) => {
  return observations.find(obs => obs.concept.name === conceptName);
};

describe("addIdentifiersToObservations", () => {
  test("observations are not modified when identifierAssignments is empty", () => {
    let conceptA1 = EntityFactory.createConcept("a1", Concept.dataType.Id);
    let conceptA2 = EntityFactory.createConcept("a2", Concept.dataType.Id);
    const form = EntityFactory.createForm("foo");
    const formElementGroup1 = EntityFactory.createFormElementGroup("bar", 1, form);
    const formElement1 = EntityFactory.createFormElement("a1", false, conceptA1, 1, "", formElementGroup1);
    const formElement2 = EntityFactory.createFormElement("a2", false, conceptA2, 2, "", formElementGroup1);
    formElementGroup1.addFormElement(formElement1);
    formElementGroup1.addFormElement(formElement2);

    const observations = [];
    const identifierAssignments = [];
    identifierAssignmentService.addIdentifiersToObservations(form, observations, identifierAssignments);
    expect(observations).toEqual([]);
  });

  test("observations are modified when identifierAssignments is present", () => {
    let conceptA1 = EntityFactory.createConcept("a1", Concept.dataType.Id);
    let conceptA2 = EntityFactory.createConcept("a2", Concept.dataType.Id);
    const form = EntityFactory.createForm("foo");
    const formElementGroup1 = EntityFactory.createFormElementGroup("bar", 1, form);
    const idSource1Uuid = "8772a4d3-cad8-46ab-a72d-40ccefaaeb98";
    const identifier1 = {
      identifier: "ABC001",
      uuid: "4acc5804-71a9-4184-8ce9-42e4575de62a",
      identifierSource: {
        name: "Id A",
        uuid: idSource1Uuid
      }
    };
    const keyValues1 = [
      KeyValue.fromResource({
        key: FormElement.keys.IdSourceUUID,
        value: idSource1Uuid
      })
    ];
    const formElement1 = EntityFactory.createFormElement("a1", false, conceptA1, 1, "", formElementGroup1, keyValues1);
    const formElement2 = EntityFactory.createFormElement("a2", false, conceptA2, 2, "", formElementGroup1);
    formElementGroup1.addFormElement(formElement1);
    formElementGroup1.addFormElement(formElement2);

    const observations = [];
    const identifierAssignments = [identifier1];
    identifierAssignmentService.addIdentifiersToObservations(form, observations, identifierAssignments);
    const a1Obs = findObsByConceptName(observations, conceptA1.name);
    const a2Obs = findObsByConceptName(observations, conceptA2.name);
    expect(a1Obs.valueJSON.value).toEqual("ABC001");
    expect(a2Obs).toBeUndefined();
  });
});
