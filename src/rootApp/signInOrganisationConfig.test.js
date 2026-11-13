import { put } from "redux-saga/effects";
import { setUserDetails } from "./saga";
import { sendInitComplete, setIsNewImplementation, setOrganisationConfig } from "./ducks";

jest.mock("common/utils/httpClient", () => ({
  httpClient: { get: jest.fn(), fetchJson: jest.fn() },
}));
jest.mock("aws-amplify/auth", () => ({ signOut: jest.fn() }));
jest.mock("adminApp/react-admin-config/authProvider", () => ({
  authProvider: { logout: jest.fn() },
}));

describe("signing in when the organisation configuration can't be loaded", () => {
  it("carries on with an empty configuration and finishes starting the app", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    sessionStorage.clear();
    const saga = setUserDetails();
    saga.next();
    saga.next({ username: "asha@org", organisationName: "Org" });
    saga.next({});
    const fetchOrganisationConfig = saga.next().value;
    expect(fetchOrganisationConfig.CALL).toBeDefined();

    expect(saga.throw(new Error("500")).value).toEqual(put(setOrganisationConfig({})));
    expect(saga.next().value).toEqual(put(setIsNewImplementation(false)));
    saga.next();
    expect(saga.next().value).toEqual(put(sendInitComplete()));
    expect(saga.next().done).toBe(true);
    console.error.mockRestore();
  });
});
