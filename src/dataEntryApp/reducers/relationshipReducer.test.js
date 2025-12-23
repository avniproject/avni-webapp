import reducer, {
  clearRelationshipError,
  getRelationshipTypes,
  removeRelationshipFailed,
  removeRelationShip,
  saveRelationshipFailed,
  saveRelationShip,
  setRelationshipTypes,
  types,
} from "./relationshipReducer";

describe("relationshipReducer", () => {
  describe("action creators", () => {
    it("should create getRelationshipTypes action", () => {
      expect(getRelationshipTypes()).toEqual({
        type: types.GET_RELATIONSHIP_TYPES,
      });
    });

    it("should create setRelationshipTypes action with relationshipTypes", () => {
      const relationshipTypes = [
        { uuid: "type-1", name: "Father" },
        { uuid: "type-2", name: "Mother" },
      ];
      expect(setRelationshipTypes(relationshipTypes)).toEqual({
        type: types.SET_RELATIONSHIP_TYPES,
        relationshipTypes,
      });
    });

    it("should create saveRelationShip action with relationData", () => {
      const relationData = {
        uuid: "relation-uuid",
        individualAUUID: "subject-a",
        individualBUUID: "subject-b",
        relationshipTypeUUID: "type-uuid",
      };
      expect(saveRelationShip(relationData)).toEqual({
        type: types.SAVE_RELATION,
        relationData,
      });
    });

    it("should create removeRelationShip action with relationId", () => {
      const relationId = "relation-uuid-123";
      expect(removeRelationShip(relationId)).toEqual({
        type: types.REMOVE_RELATION,
        relationId,
      });
    });

    it("should create saveRelationshipFailed action with errorKey", () => {
      const errorKey = "notInThisUsersCatchment";
      expect(saveRelationshipFailed(errorKey)).toEqual({
        type: types.SAVE_RELATION_FAILED,
        errorKey,
      });
    });

    it("should create removeRelationshipFailed action with errorKey", () => {
      const errorKey = "entityNotFound";
      expect(removeRelationshipFailed(errorKey)).toEqual({
        type: types.REMOVE_RELATION_FAILED,
        errorKey,
      });
    });

    it("should create clearRelationshipError action", () => {
      expect(clearRelationshipError()).toEqual({
        type: types.CLEAR_RELATIONSHIP_ERROR,
      });
    });
  });

  describe("reducer", () => {
    const initialState = {
      relationshipTypes: [],
      relationshipError: null,
    };

    it("should return initial state for unknown action", () => {
      const state = { initialState };
      const newState = reducer(state, { type: "UNKNOWN_ACTION" });
      expect(newState).toEqual(state);
    });

    it("should set relationshipTypes on SET_RELATIONSHIP_TYPES", () => {
      const relationshipTypes = [
        { uuid: "type-1", name: "Father" },
        { uuid: "type-2", name: "Mother" },
      ];
      const action = {
        type: types.SET_RELATIONSHIP_TYPES,
        relationshipTypes,
      };
      const newState = reducer({ initialState }, action);
      expect(newState.relationshipTypes).toEqual(relationshipTypes);
    });

    it("should set relationData on SET_LISTOFRELATIVES", () => {
      const relationData = [
        { uuid: "rel-1", name: "John" },
        { uuid: "rel-2", name: "Jane" },
      ];
      const action = {
        type: types.SET_LISTOFRELATIVES,
        relationData,
      };
      const newState = reducer({ initialState }, action);
      expect(newState.relationData).toEqual(relationData);
    });

    it("should set relationshipError on SAVE_RELATION_FAILED", () => {
      const errorKey = "notInThisUsersCatchment";
      const action = {
        type: types.SAVE_RELATION_FAILED,
        errorKey,
      };
      const newState = reducer({ initialState }, action);
      expect(newState.relationshipError).toBe(errorKey);
    });

    it("should set relationshipError on REMOVE_RELATION_FAILED", () => {
      const errorKey = "entityNotFound";
      const action = {
        type: types.REMOVE_RELATION_FAILED,
        errorKey,
      };
      const newState = reducer({ initialState }, action);
      expect(newState.relationshipError).toBe(errorKey);
    });

    it("should clear relationshipError on CLEAR_RELATIONSHIP_ERROR", () => {
      const stateWithError = {
        initialState,
        relationshipError: "someError",
      };
      const action = { type: types.CLEAR_RELATIONSHIP_ERROR };
      const newState = reducer(stateWithError, action);
      expect(newState.relationshipError).toBeNull();
    });

    it("should preserve existing state when setting relationshipError", () => {
      const existingState = {
        relationshipTypes: [{ uuid: "type-1", name: "Father" }],
        relationshipError: null,
      };
      const action = {
        type: types.SAVE_RELATION_FAILED,
        errorKey: "networkError",
      };
      const newState = reducer(existingState, action);
      expect(newState.relationshipTypes).toEqual(existingState.relationshipTypes);
      expect(newState.relationshipError).toBe("networkError");
    });

    it("should preserve existing state when clearing relationshipError", () => {
      const existingState = {
        relationshipTypes: [{ uuid: "type-1", name: "Father" }],
        relationshipError: "someError",
      };
      const action = { type: types.CLEAR_RELATIONSHIP_ERROR };
      const newState = reducer(existingState, action);
      expect(newState.relationshipTypes).toEqual(existingState.relationshipTypes);
      expect(newState.relationshipError).toBeNull();
    });
  });

  describe("types", () => {
    it("should have correct action type prefixes", () => {
      const prefix = "app/dataEntry/reducer/relationships/";
      expect(types.GET_RELATIONSHIP_TYPES).toBe(`${prefix}GET_RELATIONSHIP_TYPES`);
      expect(types.SET_RELATIONSHIP_TYPES).toBe(`${prefix}SET_RELATIONSHIP_TYPES`);
      expect(types.SAVE_RELATION).toBe(`${prefix}SAVE_RELATION`);
      expect(types.SAVE_RELATION_FAILED).toBe(`${prefix}SAVE_RELATION_FAILED`);
      expect(types.REMOVE_RELATION).toBe(`${prefix}REMOVE_RELATION`);
      expect(types.REMOVE_RELATION_FAILED).toBe(`${prefix}REMOVE_RELATION_FAILED`);
      expect(types.SET_LISTOFRELATIVES).toBe(`${prefix}SET_LISTOFRELATIVES`);
      expect(types.CLEAR_RELATIONSHIP_ERROR).toBe(`${prefix}CLEAR_RELATIONSHIP_ERROR`);
    });
  });
});
