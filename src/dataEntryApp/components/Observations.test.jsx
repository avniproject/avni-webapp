import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { Concept, Observation, QuestionGroup } from "avni-models";
import { RepeatableQuestionGroup } from "openchs-models";
import Observations from "./Observations";
import EntityFactory from "../test/EntityFactory";
import { httpClient } from "../../common/utils/httpClient";

jest.mock("../../common/utils/httpClient", () => ({
  httpClient: { get: jest.fn(() => Promise.resolve({ data: "signed" })) },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const HIDDEN = [{ key: "hidden", value: true }];
const concept = (
  uuid,
  name,
  dataType = Concept.dataType.Text,
  keyValues = [],
) => EntityFactory.createConcept2({ uuid, name, dataType, keyValues });
const obs = (c, value) => EntityFactory.createObservation(c, value);

const seen = concept("c-seen", "Seen answer");
const other = concept("c-other", "Other answer");
const verdict = concept(
  "c-verdict",
  "AI verdict",
  Concept.dataType.Text,
  HIDDEN,
);
const group = concept(
  "c-group",
  "Group question",
  Concept.dataType.QuestionGroup,
);

let container;
let root;

const render = async (element) => {
  await act(async () => root.render(element));
  return container;
};

beforeEach(() => {
  httpClient.get.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

const formWith = (pages) => {
  const form = EntityFactory.createForm2({ uuid: "f" });
  pages.forEach(({ name, displayOrder, elements }) => {
    const feg = EntityFactory.createFormElementGroup2({
      name,
      displayOrder,
      form,
    });
    const made = {};
    elements.forEach(({ key, concept: c, displayOrder: order, groupKey }) => {
      made[key] = EntityFactory.createFormElement2({
        uuid: `fe-${key}`,
        displayOrder: order,
        concept: c,
        formElementGroup: feg,
        group: groupKey ? made[groupKey] : undefined,
      });
    });
  });
  return form;
};

describe("Observations — hidden values", () => {
  it("does not draw a value recorded against a hidden concept", async () => {
    const view = await render(
      <Observations
        observations={[obs(seen, "shown-1"), obs(verdict, "SECRET")]}
      />,
    );

    expect(view.textContent).toContain("shown-1");
    expect(view.textContent).not.toContain("SECRET");
    expect(view.textContent).not.toContain("AI verdict");
  });

  it("does not draw a hidden answer inside a question group", async () => {
    const qg = Observation.create(
      group,
      new QuestionGroup([obs(seen, "child-shown"), obs(verdict, "SECRET")]),
    );
    const view = await render(<Observations observations={[qg]} />);

    expect(view.textContent).toContain("Group question");
    expect(view.textContent).toContain("child-shown");
    expect(view.textContent).not.toContain("SECRET");
  });

  it("does not draw a hidden answer in any repeat of a repeatable question group", async () => {
    const rqg = Observation.create(
      group,
      new RepeatableQuestionGroup([
        new QuestionGroup([obs(seen, "repeat-1"), obs(verdict, "SECRET-1")]),
        new QuestionGroup([obs(seen, "repeat-2"), obs(verdict, "SECRET-2")]),
      ]),
    );
    const view = await render(<Observations observations={[rqg]} />);

    expect(view.textContent).toContain("repeat-1");
    expect(view.textContent).toContain("repeat-2");
    expect(view.textContent).not.toContain("SECRET");
  });

  it("does not draw a hidden answer inside a question group when values are grouped by form page", async () => {
    const form = formWith([
      {
        name: "Page one",
        displayOrder: 1,
        elements: [
          { key: "g", concept: group, displayOrder: 1 },
          { key: "s", concept: seen, displayOrder: 2, groupKey: "g" },
          { key: "v", concept: verdict, displayOrder: 3, groupKey: "g" },
        ],
      },
    ]);
    const qg = Observation.create(
      group,
      new QuestionGroup([obs(seen, "child-shown"), obs(verdict, "SECRET")]),
    );
    const view = await render(<Observations observations={[qg]} form={form} />);

    expect(view.textContent).toContain("child-shown");
    expect(view.textContent).not.toContain("SECRET");
  });

  it("draws no table when every value is hidden", async () => {
    const qg = Observation.create(
      group,
      new QuestionGroup([obs(verdict, "SECRET-child")]),
    );
    const view = await render(
      <Observations observations={[obs(verdict, "SECRET"), qg]} />,
    );

    expect(view.querySelector("table")).toBeNull();
    expect(view.textContent).toBe("");
  });

  it("drops a form page whose only value is hidden, and adds no Decisions group for a hidden value off the form", async () => {
    const offForm = concept(
      "c-offform",
      "Off-form verdict",
      Concept.dataType.Text,
      HIDDEN,
    );
    const form = formWith([
      {
        name: "Page one",
        displayOrder: 1,
        elements: [{ key: "v", concept: verdict, displayOrder: 1 }],
      },
      {
        name: "Page two",
        displayOrder: 2,
        elements: [{ key: "s", concept: seen, displayOrder: 1 }],
      },
    ]);
    const view = await render(
      <Observations
        observations={[
          obs(verdict, "SECRET"),
          obs(seen, "shown-1"),
          obs(offForm, "SECRET-2"),
        ]}
        form={form}
      />,
    );

    expect(view.textContent).not.toContain("Page one");
    expect(view.textContent).not.toContain("Decisions");
    expect(view.textContent).toContain("Page two");
    expect(view.textContent).not.toContain("SECRET");
  });

  it("draws values that are not hidden exactly as it would with no hidden values at all", async () => {
    const form = formWith([
      {
        name: "Page one",
        displayOrder: 1,
        elements: [
          { key: "o", concept: other, displayOrder: 1 },
          { key: "v", concept: verdict, displayOrder: 2 },
        ],
      },
      {
        name: "Page two",
        displayOrder: 2,
        elements: [{ key: "s", concept: seen, displayOrder: 1 }],
      },
    ]);
    const visibleOnly = [obs(seen, "shown-1"), obs(other, "shown-2")];

    const without = (
      await render(
        <Observations observations={visibleOnly} form={form} customKey="k" />,
      )
    ).innerHTML;
    const withHidden = (
      await render(
        <Observations
          observations={[...visibleOnly, obs(verdict, "SECRET")]}
          form={form}
          customKey="k"
        />,
      )
    ).innerHTML;

    expect(withHidden).toBe(without);
  });

  it("does not ask for a signed link to a hidden media answer", async () => {
    const hiddenImage = concept(
      "c-image",
      "Hidden photo",
      Concept.dataType.Image,
      HIDDEN,
    );
    // An image row draws a router Link, so this render needs a router around it.
    await render(
      <MemoryRouter>
        <Observations
          observations={[
            obs(seen, "shown-1"),
            obs(hiddenImage, "https://s3/hidden.jpg"),
          ]}
        />
      </MemoryRouter>,
    );

    expect(httpClient.get).not.toHaveBeenCalled();
  });
});
