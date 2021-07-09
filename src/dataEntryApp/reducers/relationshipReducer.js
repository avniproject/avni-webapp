const prefix = "app/dataEntry/reducer/relationships/";

export const types = {
  GET_RELATIONSHIP_TYPES: `${prefix}GET_RELATIONSHIP_TYPES`,
  SET_RELATIONSHIP_TYPES: `${prefix}SET_RELATIONSHIP_TYPES`,
  SAVE_RELATION: `${prefix}SAVE_RELATION`,
  REMOVE_RELATION: `${prefix}REMOVE_RELATION`,
  SET_LISTOFRELATIVES: `${prefix}SET_LISTOFRELATIVES`
};

export const getRelationshipTypes = () => ({
  type: types.GET_RELATIONSHIP_TYPES
});

export const setRelationshipTypes = relationshipTypes => ({
  type: types.SET_RELATIONSHIP_TYPES,
  relationshipTypes
});

export const saveRelationShip = relationData => ({
  type: types.SAVE_RELATION,
  relationData
});

export const removeRelationShip = relationId => ({
  type: types.REMOVE_RELATION,
  relationId
});

const initialState = {
  relationshipTypes: []
};

export default function(state = { initialState }, action) {
  switch (action.type) {
    case types.SET_RELATIONSHIP_TYPES: {
      return {
        ...state,
        relationshipTypes: action.relationshipTypes
      };
    }
    case types.SET_LISTOFRELATIVES: {
      return {
        ...state,
        relationData: action.relationData
      };
    }
    default:
      return state;
  }
}
