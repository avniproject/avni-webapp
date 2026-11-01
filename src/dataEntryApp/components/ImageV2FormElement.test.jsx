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
  PrimitiveValue,
} from "openchs-models";
import { FormElement } from "./FormElement";
import Observations from "./Observations";
import formElementService from "../services/FormElementService";
import { toggleImageV2Uri, imageV2Uris } from "../utils/ImageV2Value";
import EntityFactory from "../test/EntityFactory";
import TestKeyValueFactory from "../test/TestKeyValueFactory";
import { httpClient } from "../../common/utils/httpClient";

jest.mock("react-redux", () => ({
  useSelector: (selector) => selector({ app: { userInfo: null } }),
}));
jest.mock("../../common/utils/httpClient", () => ({
  httpClient: {
    get: jest.fn(() => Promise.resolve({ data: "signed" })),
    uploadFile: jest.fn(),
  },
}));
jest.mock("../../adminApp/service/MediaService", () => ({
  __esModule: true,
  default: { getMedia: jest.fn(() => Promise.resolve("blob:preview")) },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const imageV2Concept = () =>
  EntityFactory.createConcept2({
    uuid: "c-img",
    name: "Photo of the house",
    dataType: Concept.dataType.ImageV2,
  });

const imageV2Element = ({
  type = "SingleSelect",
  group,
  mandatory = false,
} = {}) =>
  EntityFactory.createFormElement2({
    uuid: "fe-img",
    name: "Photo of the house",
    concept: imageV2Concept(),
    displayOrder: 1,
    mandatory,
    type,
    group,
  });

const S3_A = "https://s3.example/org/a.jpg";
const S3_B = "https://s3.example/org/b.jpg";

describe("ImageV2 value: a JSON list of media objects, as the phone stores it (#1801)", () => {
  it("a picked photo becomes a one-item list holding its address", () => {
    expect(JSON.parse(toggleImageV2Uri(null, S3_A, false))).toEqual([
      { uri: S3_A },
    ]);
  });

  it("a second photo replaces the first when only one is allowed", () => {
    const one = toggleImageV2Uri(null, S3_A, false);
    expect(JSON.parse(toggleImageV2Uri(one, S3_B, false))).toEqual([
      { uri: S3_B },
    ]);
  });

  it("a second photo is added to the list when several are allowed, keeping what the phone recorded about the first", () => {
    const fromPhone = JSON.stringify([
      { uri: S3_A, latitude: 12.9, longitude: 77.6, locationInExif: true },
    ]);
    expect(JSON.parse(toggleImageV2Uri(fromPhone, S3_B, true))).toEqual([
      { uri: S3_A, latitude: 12.9, longitude: 77.6, locationInExif: true },
      { uri: S3_B },
    ]);
  });

  it("removing the last photo clears the answer, so a mandatory question is empty again", () => {
    const one = toggleImageV2Uri(null, S3_A, true);
    expect(toggleImageV2Uri(one, S3_A, true)).toBeNull();
  });

  it("reads the addresses out of a saved answer, and nothing out of a malformed one", () => {
    expect(imageV2Uris(JSON.stringify([{ uri: S3_A }, { uri: S3_B }]))).toEqual(
      [S3_A, S3_B],
    );
    expect(imageV2Uris("not json")).toEqual([]);
    expect(imageV2Uris(null)).toEqual([]);
  });
});

describe("ImageV2 answers are stored as the JSON text, on the page and inside a question group (#1801, #1508)", () => {
  it("stores the JSON text as the answer of a question on the page", () => {
    const holder = new ObservationsHolder([]);
    const fe = imageV2Element();
    const value = toggleImageV2Uri(null, S3_A, false);
    formElementService.updateObservations(holder, fe, value);
    const observation = holder.findObservation(fe.concept);
    expect(observation.getValueWrapper().getValue()).toBe(value);
    expect(observation.toResource.value).toBe(value);
  });

  const groupWith = (repeatable) => {
    const groupElement = EntityFactory.createFormElement2({
      uuid: "fe-qg",
      concept: EntityFactory.createConcept2({
        uuid: "c-qg",
        name: "House",
        dataType: Concept.dataType.QuestionGroup,
      }),
      displayOrder: 1,
      mandatory: false,
      keyValues: repeatable
        ? [TestKeyValueFactory.create({ key: "repeatable", value: true })]
        : [],
    });
    const child = imageV2Element({ type: "MultiSelect", group: groupElement });
    return { groupElement, child };
  };

  const childValue = (holder, groupElement, child, repeatable) => {
    const wrapper = holder
      .findObservation(groupElement.concept)
      .getValueWrapper();
    const group = repeatable ? wrapper.getGroupObservationAtIndex(0) : wrapper;
    const observation = group.getObservation(child.concept);
    return observation && observation.getValueWrapper().getValue();
  };

  [false, true].forEach((repeatable) => {
    it(`keeps the whole list as one answer inside a ${repeatable ? "repeatable " : ""}question group`, () => {
      const holder = new ObservationsHolder([]);
      const { groupElement, child } = groupWith(repeatable);
      const one = toggleImageV2Uri(null, S3_A, true);
      formElementService.updateObservations(
        holder,
        groupElement,
        one,
        child,
        0,
      );
      const two = toggleImageV2Uri(one, S3_B, true);
      formElementService.updateObservations(
        holder,
        groupElement,
        two,
        child,
        0,
      );
      expect(childValue(holder, groupElement, child, repeatable)).toBe(two);
      formElementService.updateObservations(
        holder,
        groupElement,
        null,
        child,
        0,
      );
      const wrapper = holder.findObservation(groupElement.concept);
      const remaining =
        wrapper && childValue(holder, groupElement, child, repeatable);
      expect(remaining).toBeFalsy();
    });
  });
});

describe("ImageV2 on screen", () => {
  let container;
  let root;
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

  it("draws an image upload control instead of the not-supported notice", async () => {
    await act(async () =>
      root.render(
        <FormElement
          feIndex={0}
          validationResults={[]}
          filteredFormElements={[]}
          update={() => {}}
        >
          {imageV2Element({ mandatory: true })}
        </FormElement>,
      ),
    );
    expect(
      container.querySelector('[data-testid="unsupported-form-element"]'),
    ).toBeNull();
    expect(container.textContent).toContain("Upload image");
    const input = container.querySelector('input[type="file"]');
    expect(input.getAttribute("accept")).toBe("image/*");
    expect(input.multiple).toBe(false);
  });

  it("lets several photos be picked at once when the question allows several", async () => {
    await act(async () =>
      root.render(
        <FormElement
          feIndex={0}
          validationResults={[]}
          filteredFormElements={[]}
          update={() => {}}
        >
          {imageV2Element({ type: "MultiSelect" })}
        </FormElement>,
      ),
    );
    expect(container.querySelector('input[type="file"]').multiple).toBe(true);
  });

  it("shows a saved ImageV2 answer as media, signing each photo's address rather than the JSON text", async () => {
    const value = JSON.stringify([
      { uri: S3_A, latitude: 1, longitude: 2 },
      { uri: S3_B },
    ]);
    const observation = Observation.create(
      imageV2Concept(),
      new PrimitiveValue(value, Concept.dataType.ImageV2),
    );
    await act(async () =>
      root.render(
        <MemoryRouter>
          <Observations observations={[observation]} />
        </MemoryRouter>,
      ),
    );
    expect(container.textContent).toContain("Photo of the house");
    expect(container.textContent).toContain("View Media");
    const signed = httpClient.get.mock.calls.map(([url]) => url);
    expect(signed).toEqual([
      `/media/signedUrl?url=${S3_A}`,
      `/media/signedUrl?url=${S3_B}`,
    ]);
  });
});
