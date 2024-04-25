import { getNonNestedFormElements } from "./FormElementService";
import EntityFactory from "../test/EntityFactory";
import { assert } from "chai";

it("should get getNonNestedFormElements", function() {
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
