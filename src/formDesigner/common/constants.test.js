import { assert } from "chai";
import _ from "lodash";
import { FormTypeEntities, encounterFormTypes, programFormTypes } from "./constants";

/**
 * avniproject/avni-webapp#1805 - an administrator can choose Approval and Rejection when creating a form.
 *
 * The server enum alone does not make a type selectable: NewFormModal builds its list from
 * FormTypeEntities.getAllFormTypeInfo(), so a type absent from here cannot be picked no matter what the
 * server accepts.
 */
describe("FormTypeEntities - Approval and Rejection", () => {
  it("offers both types", () => {
    assert.isDefined(FormTypeEntities.Approval);
    assert.isDefined(FormTypeEntities.Rejection);
    assert.equal("Approval", FormTypeEntities.Approval.formType);
    assert.equal("Rejection", FormTypeEntities.Rejection.formType);
  });

  it("gives both a display name an administrator will recognise", () => {
    assert.equal("Approval", FormTypeEntities.Approval.display);
    assert.equal("Rejection", FormTypeEntities.Rejection.display);
  });

  /**
   * Both write to the approval decision rather than to the record being judged, so rules on these forms
   * see entityApprovalStatus - the same relationship Task has to task.
   */
  it("exposes the decision as the rule variable for both", () => {
    assert.equal("entityApprovalStatus", FormTypeEntities.Approval.ruleVariableName);
    assert.equal("entityApprovalStatus", FormTypeEntities.Rejection.ruleVariableName);
  });

  it("includes both in the list the new-form dialog is built from", () => {
    const formTypes = _.map(FormTypeEntities.getAllFormTypeInfo(), (x) => x.formType);

    assert.include(formTypes, "Approval");
    assert.include(formTypes, "Rejection");
  });

  it("finds both by form type", () => {
    assert.equal(FormTypeEntities.Approval, FormTypeEntities.getFormTypeInfo("Approval"));
    assert.equal(FormTypeEntities.Rejection, FormTypeEntities.getFormTypeInfo("Rejection"));
  });

  it("recognises both as approval decision forms, and nothing else as one", () => {
    assert.isTrue(FormTypeEntities.isApprovalDecisionForm(FormTypeEntities.Approval));
    assert.isTrue(FormTypeEntities.isApprovalDecisionForm(FormTypeEntities.Rejection));
    assert.isFalse(FormTypeEntities.isApprovalDecisionForm(FormTypeEntities.IndividualProfile));
    assert.isFalse(FormTypeEntities.isApprovalDecisionForm(FormTypeEntities.ProgramEncounter));
  });

  /**
   * AC #9 - existing form types' settings screens are unchanged. The helpers that drive those screens must
   * not start claiming the new types.
   */
  it("does not disturb the existing type predicates", () => {
    assert.isFalse(FormTypeEntities.isForProgramEncounter(FormTypeEntities.Approval));
    assert.isFalse(FormTypeEntities.isForProgramEnrolment(FormTypeEntities.Approval));
    assert.isFalse(FormTypeEntities.isForSubjectEncounter(FormTypeEntities.Approval));
    assert.isTrue(FormTypeEntities.isForProgramEncounter(FormTypeEntities.ProgramEncounter));
  });
});

/**
 * avniproject/avni-webapp#1805 AC #1 - Form Settings offers subject type, programme and encounter type
 * pickers for Approval and Rejection, so all four mapping shapes can be produced.
 *
 * FormSettings derives its two render gates from these lists. While the new types were absent from both,
 * only the subject type picker rendered, so the subject-only shape was the single mapping an
 * administrator could build - and avni-server refuses that one whenever approval is switched on for a
 * visit or programme form rather than the registration form. The only mapping the screen could produce
 * was the one that could never be valid, which is what avniproject/avni-webapp#1807 reported.
 */
describe("form type lists driving the mapping pickers", () => {
  it("includes Approval and Rejection in both, since they attach to all four shapes", () => {
    [FormTypeEntities.Approval, FormTypeEntities.Rejection].forEach((formTypeInfo) => {
      assert.isTrue(_.includes(encounterFormTypes, formTypeInfo), `${formTypeInfo.formType} must offer the visit type picker`);
      assert.isTrue(_.includes(programFormTypes, formTypeInfo), `${formTypeInfo.formType} must offer the programme picker`);
    });
  });

  /**
   * AC #9 - the settings screens of existing form types are unchanged.
   */
  it("leaves the existing membership exactly as it was", () => {
    assert.isTrue(_.includes(encounterFormTypes, FormTypeEntities.Encounter));
    assert.isTrue(_.includes(encounterFormTypes, FormTypeEntities.ProgramEncounter));
    assert.isFalse(_.includes(encounterFormTypes, FormTypeEntities.IndividualProfile));
    assert.isFalse(_.includes(encounterFormTypes, FormTypeEntities.ProgramEnrolment));

    assert.isTrue(_.includes(programFormTypes, FormTypeEntities.ProgramEnrolment));
    assert.isTrue(_.includes(programFormTypes, FormTypeEntities.ProgramExit));
    assert.isFalse(_.includes(programFormTypes, FormTypeEntities.Encounter));
    assert.isFalse(_.includes(programFormTypes, FormTypeEntities.IndividualProfile));
  });
});
