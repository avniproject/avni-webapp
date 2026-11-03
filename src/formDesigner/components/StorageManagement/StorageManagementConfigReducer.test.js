import { StorageManagementConfigReducer } from "./StorageManagementConfigReducer";

describe("StorageManagementConfigReducer", () => {
  it("updates sqlQuery", () => {
    const state = StorageManagementConfigReducer({}, { type: "sqlQuery", payload: { value: "SELECT id FROM individual" } });
    expect(state).toEqual({ sqlQuery: "SELECT id FROM individual" });
  });

  it("updates storageManagementConfig", () => {
    const config = {
      id: 1,
      uuid: "uuid-1",
      sqlQuery: "SELECT id FROM individual",
    };
    const state = StorageManagementConfigReducer({}, { type: "storageManagementConfig", payload: config });
    expect(state).toEqual(config);
  });

  it("resets state on reset action", () => {
    const initialState = {
      id: 1,
      uuid: "uuid-1",
      sqlQuery: "SELECT id FROM individual",
    };
    const state = StorageManagementConfigReducer(initialState, {
      type: "reset",
    });
    expect(state).toEqual({});
  });
});
