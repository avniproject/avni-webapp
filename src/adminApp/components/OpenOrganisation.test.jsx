import { act } from "react";
import { createRoot } from "react-dom/client";
import OpenOrganisation from "./OpenOrganisation";
import {
  saveSearchRequest,
  SEARCH_REQUEST_STORAGE_KEY,
  types,
} from "../../dataEntryApp/reducers/searchFilterReducer";

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-redux", () => ({ useDispatch: () => mockDispatch }));
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));
jest.mock("react-admin", () => ({
  useRecordContext: () => ({ uuid: "org-b-uuid" }),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("OpenOrganisation", () => {
  let container;
  let root;

  beforeEach(async () => {
    sessionStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => root.render(<OpenOrganisation />));
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("forgets the previous organisation's search when opening another organisation", async () => {
    saveSearchRequest({ subjectType: "org-a-subject-type", name: "Asha" });

    await act(async () => container.querySelector("button").click());

    expect(sessionStorage.getItem(SEARCH_REQUEST_STORAGE_KEY)).toBeNull();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: types.RESET_SEARCH_REQUEST,
    });
    expect(localStorage.getItem("ORGANISATION_UUID")).toBe("org-b-uuid");
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });
});
