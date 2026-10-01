import { assert } from "chai";
import { Concept, Observation, QuestionGroup } from "avni-models";
import { RepeatableQuestionGroup } from "openchs-models";
import EntityFactory from "../test/EntityFactory";
import { visibleGroupObservations, visibleObservations } from "./HiddenObservationUtil";

const text = (uuid, keyValues = []) => EntityFactory.createConcept2({ uuid, name: uuid, dataType: Concept.dataType.Text, keyValues });
const hiddenText = (uuid) => text(uuid, [{ key: "hidden", value: true }]);
const group = (uuid) => EntityFactory.createConcept2({ uuid, name: uuid, dataType: Concept.dataType.QuestionGroup });
const obs = (concept, value) => EntityFactory.createObservation(concept, value);
const uuids = (observations) => observations.map((o) => o.concept.uuid);

describe("HiddenObservationUtil", () => {
  it("drops a value recorded against a hidden concept and keeps the rest in order", () => {
    const observations = [obs(text("a"), "1"), obs(hiddenText("h"), "2"), obs(text("b"), "3")];

    assert.deepEqual(uuids(visibleObservations(observations)), ["a", "b"]);
  });

  it("treats a hidden marker stored as false as not hidden", () => {
    const observations = [obs(text("f", [{ key: "hidden", value: false }]), "1")];

    assert.deepEqual(uuids(visibleObservations(observations)), ["f"]);
  });

  it("drops a hidden answer inside a question group", () => {
    const children = [obs(text("a"), "1"), obs(hiddenText("h"), "2")];

    assert.deepEqual(uuids(visibleGroupObservations(children)), ["a"]);
  });

  it("keeps a question group that still has an answer to show", () => {
    const qg = Observation.create(group("g"), new QuestionGroup([obs(text("a"), "1"), obs(hiddenText("h"), "2")]));

    assert.deepEqual(uuids(visibleObservations([qg])), ["g"]);
  });

  it("drops a question group whose every answer is hidden", () => {
    const qg = Observation.create(group("g"), new QuestionGroup([obs(hiddenText("h"), "2")]));

    assert.deepEqual(uuids(visibleObservations([qg])), []);
  });

  it("drops a repeatable question group whose every answer, in every repeat, is hidden", () => {
    const rqg = Observation.create(
      group("g"),
      new RepeatableQuestionGroup([new QuestionGroup([obs(hiddenText("h1"), "1")]), new QuestionGroup([obs(hiddenText("h2"), "2")])]),
    );

    assert.deepEqual(uuids(visibleObservations([rqg])), []);
  });

  it("keeps a repeatable question group when one repeat still has an answer to show", () => {
    const rqg = Observation.create(
      group("g"),
      new RepeatableQuestionGroup([new QuestionGroup([obs(hiddenText("h1"), "1")]), new QuestionGroup([obs(text("a"), "2")])]),
    );

    assert.deepEqual(uuids(visibleObservations([rqg])), ["g"]);
  });

  it("leaves a question group with no answers as it is today", () => {
    const empty = Observation.create(group("g"), new QuestionGroup([]));
    const nullValued = Observation.create(group("n"), null);

    assert.deepEqual(uuids(visibleObservations([empty, nullValued])), ["g", "n"]);
  });

  it("returns an empty list for a missing list", () => {
    assert.deepEqual(visibleObservations(undefined), []);
    assert.deepEqual(visibleGroupObservations(undefined), []);
  });
});
