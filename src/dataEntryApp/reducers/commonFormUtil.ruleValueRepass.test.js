import commonFormUtil from "./commonFormUtil";
import { Concept, ObservationsHolder } from "openchs-models";
import EntityFactory from "../test/EntityFactory";
import { assert } from "chai";
import _ from "lodash";
import Wizard from "../state/Wizard";
import * as RuleEvaluationService from "dataEntryApp/services/RuleEvaluationService";

// avniproject/avni-client#2182 (web Data Entry parity): a question whose visibility depends on an answer
// that a rule fills in must show in the same update, not only after the user touches another question.
describe("rule-filled answers re-check visibility (#2182)", () => {
  let form, page1, page2, firstFE, dateFE, ageFE, adultOnlyFE, subject, statusesSpy;

  const findValue = (entity, concept) => {
    const obs = _.find(entity.observations, (o) => o.concept.uuid === concept.uuid);
    return obs && obs.getValue();
  };

  beforeEach(() => {
    form = EntityFactory.createForm2({ uuid: "form-2182" });
    page1 = EntityFactory.createFormElementGroup2({ name: "page 1", form, displayOrder: 1 });
    page2 = EntityFactory.createFormElementGroup2({ name: "page 2", form, displayOrder: 2 });
    const concept = (uuid, dataType) => EntityFactory.createConcept2({ uuid, name: uuid, dataType });
    const fe = (uuid, feg, c, displayOrder) =>
      EntityFactory.createFormElement2({ uuid, formElementGroup: feg, concept: c, displayOrder, mandatory: false });
    firstFE = fe("fe-first", page1, concept("c-first", Concept.dataType.Text), 1);
    dateFE = fe("fe-date", page2, concept("c-date", Concept.dataType.Date), 1);
    ageFE = fe("fe-age", page2, concept("c-age", Concept.dataType.Numeric), 2);
    adultOnlyFE = fe("fe-adult-only", page2, concept("c-adult-only", Concept.dataType.Text), 3);
    subject = EntityFactory.createSubject({});

    // Stands in for the form's rules: A (age) is filled by a rule from the date; B (adult-only) shows only when A >= 18.
    statusesSpy = jest.spyOn(RuleEvaluationService, "getFormElementsStatuses").mockImplementation((entity, feg) => {
      if (feg === page1) return [{ uuid: firstFE.uuid, visibility: true, value: null }];
      const date = findValue(entity, dateFE.concept);
      const age = findValue(entity, ageFE.concept);
      return [
        { uuid: dateFE.uuid, visibility: true, value: null },
        { uuid: ageFE.uuid, visibility: true, value: date ? 30 : null },
        { uuid: adultOnlyFE.uuid, visibility: !_.isNil(age) && age >= 18, value: null },
      ];
    });
  });

  afterEach(() => statusesSpy.mockRestore());

  const visibleUuids = (formElements) => _.map(formElements, "uuid");
  const setDate = () => new ObservationsHolder(subject.observations).addOrUpdatePrimitiveObs(dateFE.concept, new Date(1990, 0, 1));

  it("shows the dependent question in the same update when a rule fills its answer (edit path)", () => {
    const holder = new ObservationsHolder(subject.observations);
    const { filteredFormElements } = commonFormUtil.updateObservations(dateFE, new Date(1990, 0, 1), subject, holder, []);
    assert.equal(findValue(subject, ageFE.concept), 30);
    assert.include(visibleUuids(filteredFormElements), adultOnlyFE.uuid);
  });

  it("shows the dependent question when the page opens with a rule-filled answer (form load)", () => {
    setDate();
    const filtered = commonFormUtil.fetchFilteredFormElementsAndUpdateEntityObservations(page2, subject);
    assert.equal(findValue(subject, ageFE.concept), 30);
    assert.include(visibleUuids(filtered), adultOnlyFE.uuid);
  });

  it("shows the dependent question on the next page after a rule fills its answer (page next)", () => {
    setDate();
    const state = commonFormUtil.onNext({
      formElementGroup: page1,
      observations: subject.observations,
      entity: subject,
      filteredFormElements: [firstFE],
      validationResults: [],
      wizard: new Wizard(2, 1, 1),
      entityValidations: [],
      staticFormElementIds: [],
    });
    assert.equal(state.formElementGroup.name, "page 2");
    assert.equal(findValue(subject, ageFE.concept), 30);
    assert.include(visibleUuids(state.filteredFormElements), adultOnlyFE.uuid);
  });

  it("stops after at most 2 extra passes when a rule changes its value every time", () => {
    let passes = 0;
    statusesSpy.mockImplementation((entity, feg) => {
      if (feg !== page2) return [];
      passes++;
      return [{ uuid: ageFE.uuid, visibility: true, value: passes }];
    });
    commonFormUtil.fetchFilteredFormElementsAndUpdateEntityObservations(page2, subject);
    // 1 normal pass + exactly 2 extra passes, then it stops
    assert.equal(passes, 3);
  });
});
