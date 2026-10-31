jest.mock("react-markdown", () => () => null);
jest.mock("rehype-raw", () => () => null);
jest.mock("rehype-sanitize", () => () => null);
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Concept } from "openchs-models";
import { FormElement } from "./FormElement";
import EntityFactory from "../test/EntityFactory";

jest.mock("react-redux", () => ({
  useSelector: (selector) => selector({ app: { userInfo: null } }),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("FormElement with a type the Data Entry App cannot draw (#1801)", () => {
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

  const render = async (mandatory) => {
    const formElement = EntityFactory.createFormElement2({
      uuid: "fe-1",
      name: "Test Imagev2 single",
      concept: EntityFactory.createConcept2({
        uuid: "c-1",
        name: "Test Imagev2 single",
        dataType: Concept.dataType.ImageV2,
      }),
      displayOrder: 1,
      mandatory,
    });
    await act(async () =>
      root.render(
        <FormElement
          feIndex={0}
          validationResults={[]}
          filteredFormElements={[]}
        >
          {formElement}
        </FormElement>,
      ),
    );
  };

  it("names the question and says it is not supported, instead of drawing nothing", async () => {
    await render(false);
    const text = container.textContent;
    expect(text).toContain("Test Imagev2 single");
    expect(text).toContain("not supported in the Data Entry App");
    expect(text).not.toContain("mandatory");
  });

  it("explains why the page cannot be completed when the question is mandatory", async () => {
    await render(true);
    expect(container.textContent).toContain("page cannot be completed here");
  });
});
