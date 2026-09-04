import { assert } from "chai";
import _ from "lodash";
import { FormTypeEntities } from "./constants";

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
