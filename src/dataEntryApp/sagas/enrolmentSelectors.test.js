import { selectEnrolSubjectTypeFromName } from "./enrolmentSelectors";
import { assert } from "chai";

const stateWith = (subjectTypes) => ({
  dataEntry: { metadata: { operationalModules: { subjectTypes } } },
});

const mother = { uuid: "st-mother", name: "Mother", type: "Person" };
const household = { uuid: "st-house", name: "Household", type: "Household" };

describe("selectEnrolSubjectTypeFromName", () => {
  it("returns the subject type whose name matches", () => {
    const state = stateWith([mother, household]);
    assert.strictEqual(selectEnrolSubjectTypeFromName("Mother")(state), mother);
    assert.strictEqual(selectEnrolSubjectTypeFromName("Household")(state), household);
  });

  it("returns undefined when no subject type carries the given name (avni-webapp#1542)", () => {
    const state = stateWith([mother, household]);
    assert.isUndefined(selectEnrolSubjectTypeFromName("Father")(state));
  });

  it("returns undefined when the name is undefined", () => {
    const state = stateWith([mother, household]);
    // SubjectProfilePicture receives subjectTypeName={undefined} when the
    // embedded individualB on a relationship doesn't carry a subjectType.
    assert.isUndefined(selectEnrolSubjectTypeFromName(undefined)(state));
  });

  it("returns undefined when operationalModules is missing from state", () => {
    assert.isUndefined(selectEnrolSubjectTypeFromName("Mother")({}));
    assert.isUndefined(selectEnrolSubjectTypeFromName("Mother")({ dataEntry: { metadata: {} } }));
  });
});
