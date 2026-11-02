import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { httpClient } from "common/utils/httpClient";
import { logoutWatcher } from "./saga";
import { types } from "./ducks";
import { saveSearchRequest, SEARCH_REQUEST_STORAGE_KEY } from "../dataEntryApp/reducers/searchFilterReducer";

jest.mock("common/utils/httpClient", () => ({
  httpClient: { get: jest.fn(), fetchJson: jest.fn() },
}));
jest.mock("aws-amplify/auth", () => ({ signOut: jest.fn() }));
jest.mock("adminApp/react-admin-config/authProvider", () => ({
  authProvider: { logout: jest.fn() },
}));

const runLogout = async () => {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(() => ({}), applyMiddleware(sagaMiddleware));
  const task = sagaMiddleware.run(logoutWatcher);
  store.dispatch({ type: types.LOGOUT });
  await new Promise((resolve) => setTimeout(resolve, 0));
  task.cancel();
};

describe("logout", () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.spyOn(console, "error").mockImplementation(() => {});
    saveSearchRequest({ subjectType: "subject-type-uuid", name: "Asha" });
  });

  afterEach(() => console.error.mockRestore());

  it("forgets the saved search even when the server logout fails", async () => {
    httpClient.get.mockRejectedValue(new Error("Network Error"));

    await runLogout();

    expect(httpClient.get).toHaveBeenCalledWith("/web/logout");
    expect(sessionStorage.getItem(SEARCH_REQUEST_STORAGE_KEY)).toBeNull();
  });

  it("forgets the saved search when the server logout works", async () => {
    httpClient.get.mockResolvedValue({});

    await runLogout();

    expect(sessionStorage.getItem(SEARCH_REQUEST_STORAGE_KEY)).toBeNull();
  });
});
