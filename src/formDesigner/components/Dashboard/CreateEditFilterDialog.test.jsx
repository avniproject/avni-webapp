import { act } from "react";
import { createRoot } from "react-dom/client";
import { CustomFilter, DashboardFilterConfig } from "openchs-models";
import { CreateEditFilterDialog } from "./CreateEditFilterDialog";
import OperationalModulesFactory from "../../../modelTest/OperationalModulesFactory";
import SubjectTypeFactory from "../../../modelTest/SubjectTypeFactory";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en", t: (key) => key },
  }),
}));
jest.mock("../../../common/components/ToolTip", () => ({
  ToolTip: ({ toolTipKey }) =>
    require("react").createElement("span", { "data-tooltip-key": toolTipKey }),
}));
jest.mock("../../../common/components/DocumentationContainer", () => ({
  DocumentationContainer: ({ children }) => children,
}));
jest.mock("react-admin", () => ({ Title: () => null }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const operationalModules = OperationalModulesFactory.create({
  subjectTypes: [
    SubjectTypeFactory.create({ uuid: "ST1", name: "Patient" }),
    SubjectTypeFactory.create({ uuid: "ST2", name: "Household" }),
  ],
});

let container;
let root;
let handleModalClose;

beforeEach(async () => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  handleModalClose = jest.fn();
  const filterConfig = new DashboardFilterConfig();
  filterConfig.setType(CustomFilter.type.SubjectType);
  await act(async () => {
    root.render(
      <CreateEditFilterDialog
        showAddFilterModal={true}
        handleModalClose={handleModalClose}
        selectedFilter={{ uuid: "F1", name: "A filter", filterConfig }}
        operationalModules={operationalModules}
        dashboardDispatch={jest.fn()}
        dashboard={{ filters: [] }}
        setShowAddFilterModal={jest.fn()}
      />,
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const input = (id) => document.getElementById(id);
const pressKey = (field, key) =>
  field.dispatchEvent(
    new window.KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
    }),
  );
const options = () => [...document.querySelectorAll('[role="option"]')];
const shownIn = (id) => {
  const value = input(id)
    .closest('div[style*="width: 400px"]')
    .querySelector('[class*="singleValue"]');
  return value ? value.textContent : "";
};

describe("Escape in the filter dialog", () => {
  it("closes an open list without closing the dialog, keeping what was chosen", async () => {
    await act(async () => {
      input("presetSubjectType").focus();
      pressKey(input("presetSubjectType"), "ArrowDown");
    });
    await act(async () =>
      options()
        .find((option) => option.textContent === "Patient")
        .click(),
    );
    await act(async () => {
      input("presetSubjectType").focus();
      pressKey(input("presetSubjectType"), "ArrowDown");
    });
    expect(options().length).toBeGreaterThan(0);

    await act(async () => pressKey(input("presetSubjectType"), "Escape"));

    expect(handleModalClose).not.toHaveBeenCalled();
    expect(options()).toHaveLength(0);
    expect(shownIn("presetSubjectType")).toBe("Patient");
  });

  it("still closes the dialog on Escape from the filter name field", async () => {
    await act(async () => {
      input("filterName").focus();
      pressKey(input("filterName"), "Escape");
    });

    expect(handleModalClose).toHaveBeenCalledTimes(1);
  });

  it("still closes the dialog from the X button", async () => {
    const closeButton = document
      .querySelector('[data-testid="CloseIcon"]')
      .closest("button");
    await act(async () => closeButton.click());

    expect(handleModalClose).toHaveBeenCalledTimes(1);
  });
});
