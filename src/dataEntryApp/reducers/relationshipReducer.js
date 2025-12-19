const prefix = "app/dataEntry/reducer/relationships/";

export const types = {
  GET_RELATIONSHIP_TYPES: `${prefix}GET_RELATIONSHIP_TYPES`,
  SET_RELATIONSHIP_TYPES: `${prefix}SET_RELATIONSHIP_TYPES`,
  SAVE_RELATION: `${prefix}SAVE_RELATION`,
  SAVE_RELATION_SUCCESS: `${prefix}SAVE_RELATION_SUCCESS`,
  SAVE_RELATION_FAILED: `${prefix}SAVE_RELATION_FAILED`,
  REMOVE_RELATION: `${prefix}REMOVE_RELATION`,
  REMOVE_RELATION_FAILED: `${prefix}REMOVE_RELATION_FAILED`,
  SET_LISTOFRELATIVES: `${prefix}SET_LISTOFRELATIVES`,
  CLEAR_RELATIONSHIP_ERROR: `${prefix}CLEAR_RELATIONSHIP_ERROR`,
};

export const getRelationshipTypes = () => ({
  type: types.GET_RELATIONSHIP_TYPES,
});

export const setRelationshipTypes = (relationshipTypes) => ({
  type: types.SET_RELATIONSHIP_TYPES,
  relationshipTypes,
});

export const saveRelationShip = (relationData) => ({
  type: types.SAVE_RELATION,
  relationData,
});

export const removeRelationShip = (relationId) => ({
  type: types.REMOVE_RELATION,
  relationId,
});

export const saveRelationshipSuccess = () => ({
  type: types.SAVE_RELATION_SUCCESS,
});

export const saveRelationshipFailed = (errorKey) => ({
  type: types.SAVE_RELATION_FAILED,
  errorKey,
});

export const removeRelationshipFailed = (errorKey) => ({
  type: types.REMOVE_RELATION_FAILED,
  errorKey,
});

export const clearRelationshipError = () => ({
  type: types.CLEAR_RELATIONSHIP_ERROR,
});

const initialState = {
  relationshipTypes: [],
  relationshipError: null,
  saveComplete: false,
};

export default function (state = { initialState }, action) {
  switch (action.type) {
    case types.SET_RELATIONSHIP_TYPES: {
      return {
        ...state,
        relationshipTypes: action.relationshipTypes,
      };
    }
    case types.SAVE_RELATION: {
      return {
        ...state,
        saveComplete: false,
        relationshipError: null,
      };
    }
    case types.SAVE_RELATION_SUCCESS: {
      return {
        ...state,
        saveComplete: true,
      };
    }
    case types.SET_LISTOFRELATIVES: {
      return {
        ...state,
        relationData: action.relationData,
      };
    }
    case types.SAVE_RELATION_FAILED:
    case types.REMOVE_RELATION_FAILED: {
      return {
        ...state,
        relationshipError: action.errorKey,
      };
    }
    case types.CLEAR_RELATIONSHIP_ERROR: {
      return {
        ...state,
        relationshipError: null,
      };
    }
    default:
      return state;
  }
}
