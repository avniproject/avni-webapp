import { nestedFormElements } from "./FormElementService";
import EntityFactory from "../test/EntityFactory";
import { assert } from "chai";

it("should get nestedFormElements", function() {
  const f = EntityFactory;
  const formElements = [];
  formElements.push(f.createFormElement2({ name: "regular" }));
  const qg = f.createFormElement2({ name: "QG" });
  formElements.push(f.createFormElement2({ name: "qg1fe1", group: qg }));
  formElements.push(f.createFormElement2({ name: "qg1fe2", group: qg }));
  const nested = nestedFormElements(formElements);
  assert.equal(nested.length, 2);
  assert.equal(nested[1].name, qg.name);
});
