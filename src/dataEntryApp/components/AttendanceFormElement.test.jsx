import { act } from "react";
import { createRoot } from "react-dom/client";
import AttendanceFormElement from "./AttendanceFormElement";

jest.mock("react-redux", () => ({
  useSelector: (selector) =>
    selector({
      dataEntry: { subjectProfile: { subjectProfile: { uuid: "group-uuid" } } },
    }),
}));

jest.mock("../api", () => ({
  __esModule: true,
  default: {
    fetchGroupMembers: jest.fn(() =>
      Promise.resolve(
        ["Zoya", "asha", "Ravi"].map((name) => ({
          name,
          member: { subjectType: { uuid: "member-subject-type" } },
        })),
      ),
    ),
  },
}));

jest.mock("../../common/subjectModelMapper", () => ({
  mapGroupMembers: (groupSubjects) =>
    groupSubjects.map(({ name }) => ({
      memberSubject: { uuid: name, nameString: name },
    })),
  mapIndividual: jest.fn(),
}));

jest.mock("../services/SubjectService", () => ({
  subjectService: { addSubjects: jest.fn() },
}));

jest.mock("../services/FormElementService", () => ({
  getAnswerRuleFilter: () => ({ isAllowed: () => true }),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const formElement = (type) => ({
  name: "Attendance",
  mandatory: false,
  answersToShow: [],
  type,
  concept: { recordValueByKey: () => "member-subject-type" },
});

const render = async (element) => act(async () => root.render(element));

const shownNames = () =>
  [...container.querySelectorAll(".MuiFormGroup-root > div")].map(
    (row) => row.textContent,
  );

const selectAllLink = () => container.querySelector("a");

const search = async (text) => {
  const input = container.querySelector("input[type='text']");
  const setValue = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set;
  await act(async () => {
    setValue.call(input, text);
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
};

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

const renderAttendance = async ({ type = "MultiSelect", value = [], update }) =>
  render(
    <AttendanceFormElement
      formElement={formElement(type)}
      displayAllGroupMembers={true}
      update={update || jest.fn()}
      value={value}
      validationResults={[]}
      uuid="fe-uuid"
    />,
  );

describe("AttendanceFormElement search", () => {
  it("lists members A to Z with a search box", async () => {
    await renderAttendance({});
    expect(container.querySelector("input[type='text']")).not.toBeNull();
    expect(shownNames()).toEqual(["asha", "Ravi", "Zoya"]);
  });

  it("narrows the list to names matching the search, ignoring case", async () => {
    await renderAttendance({});
    await search("ZO");
    expect(shownNames()).toEqual(["Zoya"]);
    await search("a");
    expect(shownNames()).toEqual(["asha", "Ravi", "Zoya"]);
  });

  it("says there are no results when nothing matches", async () => {
    await renderAttendance({});
    await search("xyz");
    expect(shownNames()).toEqual([]);
    expect(container.textContent).toContain("zeroNumberOfResults");
  });

  it("keeps ticks made while searching once the search is cleared", async () => {
    await renderAttendance({ value: ["Zoya"] });
    await search("zo");
    await search("");
    const checked = [...container.querySelectorAll("input[type='checkbox']")]
      .filter((box) => box.checked)
      .map((box) => box.value);
    expect(checked).toEqual(["Zoya"]);
  });

  it("ticks the whole group from Select all while a search is typed", async () => {
    const update = jest.fn();
    await renderAttendance({ update });
    await search("zo");
    await act(async () => selectAllLink().click());
    expect(update.mock.calls.map(([uuid]) => uuid).sort()).toEqual([
      "Ravi",
      "Zoya",
      "asha",
    ]);
  });

  it("shows Unselect all only when the whole group is ticked, not just the names on screen", async () => {
    await renderAttendance({ value: ["Zoya"] });
    await search("zo");
    expect(selectAllLink().textContent).toBe("selectAllLabel");
  });

  it("gives a single-select question the search box but no Select all", async () => {
    await renderAttendance({ type: "SingleSelect", value: undefined });
    expect(container.querySelector("input[type='text']")).not.toBeNull();
    expect(selectAllLink()).toBeNull();
  });
});
