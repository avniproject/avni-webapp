import { act } from "react";
import { createRoot } from "react-dom/client";
import { Concept, ObservationsHolder } from "openchs-models";
import { FormElement } from "./FormElement";
import QuestionGroupFormElement from "./QuestionGroupFormElement";
import { RepeatableQuestionGroupElement } from "./RepeatableQuestionGroupElement";
import formElementService from "../services/FormElementService";
import EntityFactory from "../test/EntityFactory";
import TestKeyValueFactory from "../test/TestKeyValueFactory";

// Each question's own control is FormElement, pinned by its own tests. The stub prints the
// concept name so the test can read which questions a group drew.
jest.mock("./FormElement", () => ({
  FormElement: jest.fn(({ children: formElement }) => (
    <div className="question">{formElement.concept.name}</div>
  )),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const concept = (uuid, name, dataType, hidden = false) =>
  EntityFactory.createConcept2({
    uuid,
    name,
    dataType,
    keyValues: hidden ? [{ key: "hidden", value: true }] : [],
  });

// A group with a visible child and a hidden child. Repeatable when asked.
const group = ({ repeatable }) => {
  const form = EntityFactory.createForm2({ uuid: "form-qg" });
  const formElementGroup = EntityFactory.createFormElementGroup2({
    uuid: "feg-qg",
    form,
    displayOrder: 1,
  });
  const groupElement = EntityFactory.createFormElement2({
    uuid: "fe-qg",
    formElementGroup,
    concept: concept("c-qg", "Assessment", Concept.dataType.QuestionGroup),
    displayOrder: 1,
    mandatory: false,
    keyValues: repeatable
      ? [TestKeyValueFactory.create({ key: "repeatable", value: true })]
      : [],
  });
  const seen = EntityFactory.createFormElement2({
    uuid: "fe-seen",
    formElementGroup,
    concept: concept("c-seen", "Seen answer", Concept.dataType.Text),
    displayOrder: 1,
    mandatory: false,
    group: groupElement,
  });
  const hidden = EntityFactory.createFormElement2({
    uuid: "fe-hidden",
    formElementGroup,
    concept: concept("c-hidden", "AI verdict", Concept.dataType.Text, true),
    displayOrder: 2,
    mandatory: false,
    group: groupElement,
  });
  return { groupElement, seen, hidden };
};

// What the form reducer hands a repeating group: one copy of each child per row.
const inRow = (formElement, questionGroupIndex) => {
  const copy = formElement.clone();
  copy.questionGroupIndex = questionGroupIndex;
  return copy;
};

const render = async (element) => act(async () => root.render(element));

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

describe("A question group in the data entry form", () => {
  it("draws its visible child and not its hidden one", async () => {
    const { groupElement, seen, hidden } = group({ repeatable: false });
    const filteredFormElements = [groupElement, seen, hidden];

    await render(
      <QuestionGroupFormElement
        formElement={groupElement}
        obsHolder={new ObservationsHolder([])}
        validationResults={[]}
        filteredFormElements={filteredFormElements}
        updateObs={jest.fn()}
      />,
    );

    expect(drawn()).toEqual(["Seen answer"]);
    FormElement.mock.calls.forEach(([props]) =>
      expect(props.filteredFormElements).toBe(filteredFormElements),
    );
  });
});

describe("A repeating question group in the data entry form", () => {
  it("draws the hidden child in no row, and the visible child in every row", async () => {
    const { groupElement, seen, hidden } = group({ repeatable: true });
    const obsHolder = new ObservationsHolder([]);
    formElementService.updateObservations(
      obsHolder,
      groupElement,
      "first",
      seen,
      0,
    );
    formElementService.updateObservations(
      obsHolder,
      groupElement,
      "SECRET",
      hidden,
      0,
    );
    // A fresh repeating group has one row; the form's "Add One More" adds the next the same way.
    obsHolder
      .findObservation(groupElement.concept)
      .getValueWrapper()
      .addQuestionGroup();
    formElementService.updateObservations(
      obsHolder,
      groupElement,
      "second",
      seen,
      1,
    );
    const filteredFormElements = [
      groupElement,
      inRow(seen, 0),
      inRow(hidden, 0),
      inRow(seen, 1),
      inRow(hidden, 1),
    ];

    await render(
      <RepeatableQuestionGroupElement
        formElement={groupElement}
        obsHolder={obsHolder}
        validationResults={[]}
        filteredFormElements={filteredFormElements}
        updateObs={jest.fn()}
        addNewQuestionGroup={jest.fn()}
        removeQuestionGroup={jest.fn()}
      />,
    );

    expect(drawn()).toEqual(["Seen answer", "Seen answer"]);
    expect(container.textContent).not.toContain("SECRET");
    FormElement.mock.calls.forEach(([props]) =>
      expect(props.filteredFormElements).toBe(filteredFormElements),
    );
  });
});
