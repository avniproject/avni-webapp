import { act } from "react";
import { createRoot } from "react-dom/client";
import { useSelector } from "react-redux";
import { Concept } from "avni-models";
import Summary from "./Summary";
import EntityFactory from "../../test/EntityFactory";

jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(),
}));

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
const obs = (c, value) => EntityFactory.createObservation(c, value);

const withRulesResponse = (rulesResponse) =>
  useSelector.mockImplementation((selector) =>
    selector({
      dataEntry: {
        serverSideRulesReducer: { rulesResponse, isFetching: false },
      },
    }),
  );

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

describe("Summary", () => {
  it("prints no System recommendations or Observations heading when every value under it is hidden", async () => {
    withRulesResponse({
      decisionObservations: [obs(verdict, "SECRET")],
      visitSchedules: [],
    });
    await act(async () =>
      root.render(
        <Summary
          observations={[obs(verdict, "SECRET-2")]}
          additionalRows={[]}
        />,
      ),
    );

    expect(container.textContent).not.toContain("systemRecommendations");
    expect(container.textContent).not.toContain("observations");
    expect(container.textContent).not.toContain("SECRET");
  });

  it("still prints both headings when a value under each is not hidden", async () => {
    withRulesResponse({
      decisionObservations: [obs(seen, "decided")],
      visitSchedules: [],
    });
    await act(async () =>
      root.render(
        <Summary observations={[obs(seen, "recorded")]} additionalRows={[]} />,
      ),
    );

    expect(container.textContent).toContain("systemRecommendations");
    expect(container.textContent).toContain("observations");
  });
});
