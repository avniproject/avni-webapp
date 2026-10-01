import { act } from "react";
import { createRoot } from "react-dom/client";
import { Concept } from "avni-models";
import RuleSummary from "./RuleSummary";
import EntityFactory from "../../../test/EntityFactory";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const verdict = EntityFactory.createConcept2({
  uuid: "c-verdict",
  name: "AI verdict",
  dataType: Concept.dataType.Text,
  keyValues: [{ key: "hidden", value: true }],
});
const seen = EntityFactory.createConcept2({
  uuid: "c-seen",
  name: "Seen answer",
  dataType: Concept.dataType.Text,
});

let container;
let root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("RuleSummary", () => {
  it("reads as no summary when every summary value is hidden", async () => {
    await act(async () =>
      root.render(
        <RuleSummary
          title="subjectSummary"
          summaryObservations={[
            EntityFactory.createObservation(verdict, "SECRET"),
          ]}
        />,
      ),
    );

    expect(container.textContent).toContain("summaryNotFound");
    expect(container.textContent).not.toContain("SECRET");
  });

  it("still shows a summary value that is not hidden", async () => {
    await act(async () =>
      root.render(
        <RuleSummary
          title="subjectSummary"
          summaryObservations={[
            EntityFactory.createObservation(seen, "shown-1"),
          ]}
        />,
      ),
    );

    expect(container.textContent).toContain("shown-1");
    expect(container.textContent).not.toContain("summaryNotFound");
  });
});
