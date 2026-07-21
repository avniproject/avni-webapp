import { getAnswerRuleFilter, getNonNestedFormElements } from "./FormElementService";
import EntityFactory from "../test/EntityFactory";
import { assert } from "chai";

it("should get getNonNestedFormElements", function () {
  const f = EntityFactory;
  const formElements = [];
  formElements.push(f.createFormElement2({ name: "regular" }));
  const qg = f.createFormElement2({ name: "QG" });
  formElements.push(qg);
  formElements.push(f.createFormElement2({ name: "qg1fe1", group: qg }));
  formElements.push(f.createFormElement2({ name: "qg1fe2", group: qg }));
  const nested = getNonNestedFormElements(formElements);
  assert.equal(nested.length, 2);
  assert.equal(nested[1].name, qg.name);
});

describe("getAnswerRuleFilter", () => {
  const formElementWith = (answersToShow, answersToExclude) => ({
    answersToShow,
    answersToExclude,
  });

  it("keeps everything when there is no allow-list and nothing excluded", () => {
    const { hasAllowedList, isAllowed, allowedUUIDs } = getAnswerRuleFilter(formElementWith(undefined, undefined));
    assert.isFalse(hasAllowedList);
    assert.isNull(allowedUUIDs);
    assert.isTrue(isAllowed("a"));
    assert.isTrue(isAllowed("b"));
  });

  it("empty answersToShow is treated as no allow-list (show all)", () => {
    const { hasAllowedList, isAllowed } = getAnswerRuleFilter(formElementWith([], []));
    assert.isFalse(hasAllowedList);
    assert.isTrue(isAllowed("anything"));
  });

  it("excludes listed answers even when there is no allow-list", () => {
    const { isAllowed, allowedUUIDs } = getAnswerRuleFilter(formElementWith(undefined, ["b"]));
    assert.isTrue(isAllowed("a"));
    assert.isFalse(isAllowed("b"));
    assert.isNull(allowedUUIDs);
  });

  it("restricts to the allow-list when answersToShow is present", () => {
    const { hasAllowedList, isAllowed, allowedUUIDs } = getAnswerRuleFilter(formElementWith(["a", "b"], undefined));
    assert.isTrue(hasAllowedList);
    assert.deepEqual(allowedUUIDs, ["a", "b"]);
    assert.isTrue(isAllowed("a"));
    assert.isFalse(isAllowed("c"));
  });

  it("applies exclude on top of the allow-list", () => {
    const { isAllowed, allowedUUIDs } = getAnswerRuleFilter(formElementWith(["a", "b", "c"], ["b"]));
    assert.deepEqual(allowedUUIDs, ["a", "c"]);
    assert.isTrue(isAllowed("a"));
    assert.isFalse(isAllowed("b"));
    assert.isTrue(isAllowed("c"));
  });
});
