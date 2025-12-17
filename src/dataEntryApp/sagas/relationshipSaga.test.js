import { call, put } from "redux-saga/effects";
import { relationshipTypeWorker, removeRelatioshipWorker, saveRelatioshipWorker } from "./relationshipSaga";
import { removeRelationshipFailed, saveRelationshipFailed, setRelationshipTypes } from "../reducers/relationshipReducer";
import api from "../api";
import { getAPIErrorMessage } from "./sagaUtils";

describe("relationshipSaga", () => {
  describe("saveRelatioshipWorker", () => {
    const relationData = {
      uuid: "test-uuid",
      individualAUUID: "subject-a-uuid",
      individualBUUID: "subject-b-uuid",
      relationshipTypeUUID: "relation-type-uuid",
      enterDateTime: new Date(),
    };

    it("should call api.saveRelationShip with relationData on success", () => {
      const gen = saveRelatioshipWorker({ relationData });

      const callEffect = gen.next().value;
      expect(callEffect).toEqual(call(api.saveRelationShip, relationData));

      const result = gen.next().done;
      expect(result).toBe(true);
    });

    it("should dispatch saveRelationshipFailed on catchment error", () => {
      const gen = saveRelatioshipWorker({ relationData });

      gen.next();

      const error = {
        response: {
          data: {
            message: "Not in your catchment",
          },
        },
      };

      const putEffect = gen.throw(error).value;
      const expectedErrorKey = getAPIErrorMessage(error);
      expect(putEffect).toEqual(put(saveRelationshipFailed(expectedErrorKey)));
    });

    it("should dispatch saveRelationshipFailed on network error", () => {
      const gen = saveRelatioshipWorker({ relationData });

      gen.next();

      const error = {
        message: "Network error",
      };

      const putEffect = gen.throw(error).value;
      const expectedErrorKey = getAPIErrorMessage(error);
      expect(putEffect).toEqual(put(saveRelationshipFailed(expectedErrorKey)));
    });

    it("should dispatch saveRelationshipFailed with original message for unmapped errors", () => {
      const gen = saveRelatioshipWorker({ relationData });

      gen.next();

      const error = {
        response: {
          data: {
            message: "Some unknown server error",
          },
        },
      };

      const putEffect = gen.throw(error).value;
      const expectedErrorKey = getAPIErrorMessage(error);
      expect(putEffect).toEqual(put(saveRelationshipFailed(expectedErrorKey)));
      // Unmapped errors return the original message
      expect(expectedErrorKey).toBe("Some unknown server error");
    });

    it("should dispatch saveRelationshipFailed on sync attribute error", () => {
      const gen = saveRelatioshipWorker({ relationData });

      gen.next();

      const error = {
        response: {
          data: {
            message: "Sync attribute for user not valid for update",
          },
        },
      };

      const putEffect = gen.throw(error).value;
      const expectedErrorKey = getAPIErrorMessage(error);
      expect(putEffect).toEqual(put(saveRelationshipFailed(expectedErrorKey)));
      expect(expectedErrorKey).toBe("syncAttributeForUserNotValidForUpdate");
    });
  });

  describe("removeRelatioshipWorker", () => {
    const relationId = "relation-uuid-123";

    it("should call api.removeRelationShip with relationId on success", () => {
      const gen = removeRelatioshipWorker({ relationId });

      const callEffect = gen.next().value;
      expect(callEffect).toEqual(call(api.removeRelationShip, relationId));

      const result = gen.next().done;
      expect(result).toBe(true);
    });

    it("should dispatch removeRelationshipFailed on subject not found error", () => {
      const gen = removeRelatioshipWorker({ relationId });

      gen.next();

      const error = {
        response: {
          data: {
            message: "Subject not found",
          },
        },
      };

      const putEffect = gen.throw(error).value;
      const expectedErrorKey = getAPIErrorMessage(error);
      expect(putEffect).toEqual(put(removeRelationshipFailed(expectedErrorKey)));
      expect(expectedErrorKey).toBe("subjectNotFound");
    });

    it("should dispatch removeRelationshipFailed on network error", () => {
      const gen = removeRelatioshipWorker({ relationId });

      gen.next();

      const error = {
        message: "Network error",
      };

      const putEffect = gen.throw(error).value;
      const expectedErrorKey = getAPIErrorMessage(error);
      expect(putEffect).toEqual(put(removeRelationshipFailed(expectedErrorKey)));
      expect(expectedErrorKey).toBe("networkError");
    });

    it("should dispatch removeRelationshipFailed on catchment error", () => {
      const gen = removeRelatioshipWorker({ relationId });

      gen.next();

      const error = {
        response: {
          data: {
            message: "Not in your catchment",
          },
        },
      };

      const putEffect = gen.throw(error).value;
      const expectedErrorKey = getAPIErrorMessage(error);
      expect(putEffect).toEqual(put(removeRelationshipFailed(expectedErrorKey)));
      expect(expectedErrorKey).toBe("notInThisUsersCatchment");
    });
  });

  describe("relationshipTypeWorker", () => {
    it("should fetch relationship types and dispatch setRelationshipTypes", () => {
      const gen = relationshipTypeWorker();

      const callEffect = gen.next().value;
      expect(callEffect).toEqual(call(api.fetchRelationshipTypes));

      const relationshipTypes = [
        { uuid: "type-1", name: "Father" },
        { uuid: "type-2", name: "Mother" },
      ];

      const putEffect = gen.next(relationshipTypes).value;
      expect(putEffect).toEqual(put(setRelationshipTypes(relationshipTypes)));

      const result = gen.next().done;
      expect(result).toBe(true);
    });

    it("should handle empty relationship types", () => {
      const gen = relationshipTypeWorker();

      gen.next();

      const relationshipTypes = [];

      const putEffect = gen.next(relationshipTypes).value;
      expect(putEffect).toEqual(put(setRelationshipTypes(relationshipTypes)));
    });
  });
});
