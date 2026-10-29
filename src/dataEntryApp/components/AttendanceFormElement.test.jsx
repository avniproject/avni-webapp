import { act } from "react";
import { createRoot } from "react-dom/client";
import AttendanceFormElement from "./AttendanceFormElement";

let mockMemberNames;

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
        mockMemberNames.map((name) => ({
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
  [...container.querySelectorAll(".MuiFormGroup-root > label")].map(
    (row) => row.textContent,
  );

const buttonLabelled = (...labels) =>
  [...container.querySelectorAll("button")].find((button) =>
    labels.includes(button.textContent),
  );

const selectAllButton = () =>
  buttonLabelled("selectAllLabel", "unselectAllLabel");

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
  mockMemberNames = ["Zoya", "asha", "Ravi"];
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
    await act(async () => selectAllButton().click());
    expect(update.mock.calls.map(([uuid]) => uuid).sort()).toEqual([
      "Ravi",
      "Zoya",
      "asha",
    ]);
  });

  it("shows Unselect all only when the whole group is ticked, not just the names on screen", async () => {
    await renderAttendance({ value: ["Zoya"] });
    await search("zo");
    expect(selectAllButton().textContent).toBe("selectAllLabel");
  });

  it("gives a single-select question the search box but no Select all", async () => {
    await renderAttendance({ type: "SingleSelect", value: undefined });
    expect(container.querySelector("input[type='text']")).not.toBeNull();
    expect(selectAllButton()).toBeUndefined();
  });

  it("flips the list between A to Z and Z to A", async () => {
    await renderAttendance({});
    await act(async () => buttonLabelled("A–Z").click());
    expect(shownNames()).toEqual(["Zoya", "Ravi", "asha"]);
    await search("a");
    expect(shownNames()).toEqual(["Zoya", "Ravi", "asha"]);
    await act(async () => buttonLabelled("Z–A").click());
    expect(shownNames()).toEqual(["asha", "Ravi", "Zoya"]);
  });

  it("ticks a member when the name is clicked, not only the box", async () => {
    const update = jest.fn();
    await renderAttendance({ update });
    await act(async () =>
      container.querySelectorAll(".MuiFormGroup-root > label")[1].click(),
    );
    expect(update).toHaveBeenCalledWith("Ravi");
  });

  it("matches each typed word on its own, in any order", async () => {
    mockMemberNames = ["Asha Kumari Devi", "Asha Patil", "Jean-Paul Rao"];
    await renderAttendance({});
    await search("asha devi");
    expect(shownNames()).toEqual(["Asha Kumari Devi"]);
    await search("devi  asha");
    expect(shownNames()).toEqual(["Asha Kumari Devi"]);
    await search("paul-jean");
    expect(shownNames()).toEqual(["Jean-Paul Rao"]);
    await search("asha xyz");
    expect(shownNames()).toEqual([]);
  });

  it("keeps the list at its full height while searching, so the page does not jump", async () => {
    const offsetHeight = jest
      .spyOn(window.HTMLElement.prototype, "offsetHeight", "get")
      .mockReturnValue(300);
    await renderAttendance({});
    const memberList = container.querySelector(".MuiFormGroup-root");
    await search("zo");
    expect(memberList.style.minHeight).toBe("300px");
    await search("");
    expect(memberList.style.minHeight).toBe("");
    offsetHeight.mockRestore();
  });
});
