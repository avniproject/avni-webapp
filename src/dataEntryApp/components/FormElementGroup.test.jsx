import { act } from "react";
import { createRoot } from "react-dom/client";
import { Concept, ObservationsHolder } from "openchs-models";
import { FormElement } from "./FormElement";
import { FormElementGroup } from "./FormElementGroup";
import EntityFactory from "../test/EntityFactory";

// Each question's own control is FormElement, pinned by its own tests. Here only which
// questions get drawn matters, so the stub prints the concept name and nothing else.
jest.mock("./FormElement", () => ({
  FormElement: jest.fn(({ children: formElement }) => (
    <div className="question">{formElement.concept.name}</div>
  )),
}));
jest.mock("react-redux", () => ({
  useSelector: (selector) => selector({ app: { userInfo: null } }),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const concept = (uuid, name, hidden = false) =>
  EntityFactory.createConcept2({
    uuid,
    name,
    dataType: Concept.dataType.Text,
    keyValues: hidden ? [{ key: "hidden", value: true }] : [],
  });

const question = (uuid, c, displayOrder) =>
  EntityFactory.createFormElement2({
    uuid,
    concept: c,
    displayOrder,
    mandatory: false,
  });

const page = () => [
  question("fe-1", concept("c-1", "First"), 1),
  question("fe-2", concept("c-2", "AI verdict", true), 2),
  question("fe-3", concept("c-3", "Third"), 3),
];

const render = async (filteredFormElements) =>
  act(async () =>
    root.render(
      <FormElementGroup
        obsHolder={new ObservationsHolder([])}
        filteredFormElements={filteredFormElements}
        validationResults={[]}
        updateObs={jest.fn()}
      />,
    ),
  );

const drawn = () =>
  [...container.querySelectorAll(".question")].map((node) => node.textContent);

beforeEach(() => {
  FormElement.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("A page in the data entry form", () => {
  it("draws every question but the hidden one, in order", async () => {
    await render(page());

    expect(drawn()).toEqual(["First", "Third"]);
  });

  it("hands the whole list down unchanged, hidden question included, so no saved answer is dropped", async () => {
    const filteredFormElements = page();
    await render(filteredFormElements);

    expect(FormElement).toHaveBeenCalledTimes(2);
    FormElement.mock.calls.forEach(([props]) =>
      expect(props.filteredFormElements).toBe(filteredFormElements),
    );
  });

  it("draws every question when none is hidden", async () => {
    await render([
      question("fe-1", concept("c-1", "First"), 1),
      question("fe-2", concept("c-2", "Second"), 2),
    ]);

    expect(drawn()).toEqual(["First", "Second"]);
  });
});
