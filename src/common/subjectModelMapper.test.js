import { assert } from "chai";
import { mapObservation } from "./subjectModelMapper";
import { isConceptHidden } from "../formDesigner/util/HiddenConceptUtil";

const conceptJson = (uuid, name, dataType, keyValues) => ({ uuid, name, dataType, answers: [], keyValues });

describe("subjectModelMapper", () => {
  it("keeps a concept's key-values, so the hidden marker reaches the data entry app", () => {
    const observation = mapObservation({
      concept: conceptJson("c-verdict", "Verdict", "Text", [{ key: "hidden", value: true }]),
      value: "SECRET",
    });

    assert.isTrue(isConceptHidden(observation.concept));
    assert.equal(observation.concept.recordValueByKey("hidden"), true);
  });

  it("keeps key-values on the answers inside a question group", () => {
    const observation = mapObservation({
      concept: conceptJson("c-group", "Group", "QuestionGroup", []),
      value: [
        { concept: conceptJson("c-visible", "Seen", "Text", []), value: "shown" },
        { concept: conceptJson("c-verdict", "Verdict", "Text", [{ key: "hidden", value: true }]), value: "SECRET" },
      ],
    });

    const [seen, verdict] = observation.getValueWrapper().getValue();
    assert.isFalse(isConceptHidden(seen.concept));
    assert.isTrue(isConceptHidden(verdict.concept));
  });

  it("maps a concept that has no key-values to an empty list", () => {
    const observation = mapObservation({ concept: conceptJson("c-plain", "Plain", "Text", undefined), value: "x" });

    assert.lengthOf(observation.concept.keyValues, 0);
    assert.isFalse(isConceptHidden(observation.concept));
  });
});
