jest.mock("react-markdown", () => () => null);
jest.mock("rehype-raw", () => () => null);
jest.mock("rehype-sanitize", () => () => null);
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import {
  Concept,
  Observation,
  ObservationsHolder,
  SingleCodedValue,
  MultipleCodedValues,
} from "openchs-models";
import { FormElement } from "./FormElement";
import Observations from "./Observations";
import formElementService from "../services/FormElementService";
import EntityFactory from "../test/EntityFactory";
import api from "../api";

jest.mock("react-redux", () => ({
  useSelector: (selector) => selector({ app: { userInfo: null } }),
}));
jest.mock("../api", () => ({
  __esModule: true,
  default: { fetchSubjectGeneral: jest.fn(), fetchEncounter: jest.fn() },
}));
jest.mock("../../common/utils/httpClient", () => ({
  httpClient: { get: jest.fn(() => Promise.resolve({ data: "signed" })) },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const VISIT_TYPE = "et-visit";
const OTHER_TYPE = "et-other";
const SUBJECT = "subject-1";

const encounterConcept = (identifier = "{Date}") =>
  EntityFactory.createConcept2({
    uuid: "c-enc",
    name: "Earlier visit",
    dataType: Concept.dataType.Encounter,
    keyValues: [
      { key: "encounterTypeUUID", value: VISIT_TYPE },
      { key: "encounterScope", value: "Within Subject" },
      { key: "encounterIdentifier", value: identifier },
    ],
  });

const encounterElement = ({
  type = "SingleSelect",
  identifier,
  keyValues = [],
} = {}) =>
  EntityFactory.createFormElement2({
    uuid: "fe-enc",
    name: "Earlier visit",
    concept: encounterConcept(identifier),
    displayOrder: 1,
    mandatory: false,
    type,
    keyValues,
  });

const listed = (uuid, encounterTypeUuid, encounterDateTime, extra = {}) => ({
  uuid,
  encounterType: { uuid: encounterTypeUuid, name: "Visit" },
  encounterDateTime,
  voided: false,
  ...extra,
});

const subjectEncounters = {
  encounters: [
    listed("enc-1", VISIT_TYPE, "2026-10-01T05:00:00.000Z"),
    listed("enc-2", VISIT_TYPE, "2026-10-15T05:00:00.000Z"),
    listed("enc-other", OTHER_TYPE, "2026-10-20T05:00:00.000Z"),
    listed("enc-scheduled", VISIT_TYPE, null, {
      earliestVisitDateTime: "2026-11-20T05:00:00.000Z",
    }),
  ],
};

describe("Encounter answers are stored as the phone stores them: the chosen visit's id", () => {
  it("keeps one visit for a single-select question and replaces it when another is picked", () => {
    const holder = new ObservationsHolder([]);
    const fe = encounterElement();
    formElementService.updateObservations(holder, fe, "enc-1");
    formElementService.updateObservations(holder, fe, "enc-2");
    const value = holder.findObservation(fe.concept).getValueWrapper();
    expect(value).toBeInstanceOf(SingleCodedValue);
    expect(value.getValue()).toBe("enc-2");
  });

  it("keeps a list of visits for a multi-select question", () => {
    const holder = new ObservationsHolder([]);
    const fe = encounterElement({ type: "MultiSelect" });
    formElementService.updateObservations(holder, fe, "enc-1");
    formElementService.updateObservations(holder, fe, "enc-2");
    const value = holder.findObservation(fe.concept).getValueWrapper();
    expect(value).toBeInstanceOf(MultipleCodedValues);
    expect(value.getValue()).toEqual(["enc-1", "enc-2"]);
  });
});

describe("Encounter question on screen", () => {
  let container;
  let root;
  beforeEach(() => {
    api.fetchSubjectGeneral.mockReset();
    api.fetchEncounter.mockReset();
    api.fetchSubjectGeneral.mockResolvedValue(subjectEncounters);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  const draw = async (fe, { value = null, update = () => {} } = {}) => {
    await act(async () =>
      root.render(
        <FormElement
          feIndex={0}
          validationResults={[]}
          filteredFormElements={[]}
          value={value}
          update={update}
          subjectUUID={SUBJECT}
        >
          {fe}
        </FormElement>,
      ),
    );
  };

  const optionLabels = () =>
    Array.from(container.querySelectorAll("label")).map((label) =>
      label.textContent.trim(),
    );

  it("lists this subject's visits of the question's type, as the phone does, instead of the not-supported notice", async () => {
    await draw(encounterElement());
    expect(api.fetchSubjectGeneral).toHaveBeenCalledWith(SUBJECT);
    expect(
      container.querySelector('[data-testid="unsupported-form-element"]'),
    ).toBeNull();
    const labels = optionLabels();
    expect(labels).toHaveLength(3);
    expect(labels.some((l) => l.includes("2026"))).toBe(true);
    expect(labels.some((l) => l.includes("scheduledDate"))).toBe(true);
  });

  it("answers with the chosen visit's id", async () => {
    const update = jest.fn();
    await draw(encounterElement(), { update });
    await act(async () =>
      container.querySelector('input[value="enc-2"]').click(),
    );
    expect(update).toHaveBeenCalledWith("enc-2");
  });

  it("offers check boxes for a multi-select question and marks the saved visits", async () => {
    await draw(encounterElement({ type: "MultiSelect" }), { value: ["enc-1"] });
    expect(
      container.querySelector('input[type="checkbox"][value="enc-1"]').checked,
    ).toBe(true);
    expect(
      container.querySelector('input[type="checkbox"][value="enc-2"]').checked,
    ).toBe(false);
  });

  it("leaves out visits a rule excluded", async () => {
    const fe = encounterElement();
    fe.answersToExclude = ["enc-1"];
    await draw(fe);
    expect(container.querySelector('input[value="enc-1"]')).toBeNull();
    expect(container.querySelector('input[value="enc-2"]')).not.toBeNull();
  });

  it("labels visits by the concept's identifier, reading answers recorded in the visit", async () => {
    api.fetchEncounter.mockImplementation((uuid) =>
      Promise.resolve({
        ...listed(uuid, VISIT_TYPE, "2026-10-01T05:00:00.000Z"),
        observations: [
          {
            concept: { uuid: "c-note", name: "Visit note", dataType: "Text" },
            value: `note of ${uuid}`,
          },
        ],
      }),
    );
    await draw(encounterElement({ identifier: "Visit: {Visit note}" }));
    expect(optionLabels()).toContain("Visit: note of enc-1");
  });

  it("shows a saved Encounter answer by its visit label instead of failing", async () => {
    api.fetchEncounter.mockResolvedValue(
      listed("enc-2", VISIT_TYPE, "2026-10-15T05:00:00.000Z"),
    );
    const observation = Observation.create(
      encounterConcept(),
      new SingleCodedValue("enc-2"),
    );
    await act(async () =>
      root.render(
        <MemoryRouter>
          <Observations observations={[observation]} />
        </MemoryRouter>,
      ),
    );
    expect(container.textContent).toContain("Earlier visit");
    expect(api.fetchEncounter).toHaveBeenCalledWith("enc-2");
    expect(container.textContent).toMatch(
      /15 Oct 2026|Oct 15, 2026|15-Oct-2026/,
    );
  });
});
