import { put } from "redux-saga/effects";
import { setUserDetails } from "./saga";
import {
  resetSearchRequest,
  saveSearchRequest,
  SEARCH_REQUEST_STORAGE_KEY,
} from "../dataEntryApp/reducers/searchFilterReducer";

jest.mock("common/utils/httpClient", () => ({
  httpClient: { get: jest.fn(), fetchJson: jest.fn() },
}));
jest.mock("aws-amplify/auth", () => ({ signOut: jest.fn() }));
jest.mock("adminApp/react-admin-config/authProvider", () => ({
  authProvider: { logout: jest.fn() },
}));

const signInAs = (username) => {
  const saga = setUserDetails();
  saga.next();
  return saga.next({ username, organisationName: "" }).value;
};

describe("signing in on a tab with a saved search", () => {
  beforeEach(() => {
    sessionStorage.clear();
    saveSearchRequest({ subjectType: "subject-type-uuid", name: "Asha" }, "asha@org");
  });

  it("forgets another user's search, in the tab and in the app", () => {
    expect(signInAs("ravi@org")).toEqual(put(resetSearchRequest()));
    expect(sessionStorage.getItem(SEARCH_REQUEST_STORAGE_KEY)).toBeNull();
  });

  it("keeps the user's own search", () => {
    expect(signInAs("asha@org")).not.toEqual(put(resetSearchRequest()));
    expect(sessionStorage.getItem(SEARCH_REQUEST_STORAGE_KEY)).not.toBeNull();
  });
});
