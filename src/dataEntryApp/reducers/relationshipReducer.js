const prefix = "app/dataEntry/reducer/relationships/";

export const types = {
  GET_RELATION: `${prefix}GET_RELATION`,
  SET_RELATION: `${prefix}SET_RELATION`,
  SAVE_RELATION: `${prefix}SAVE_RELATION`,
  REMOVE_RELATION: `${prefix}REMOVE_RELATION`,
  SET_LISTOFRELATIVES: `${prefix}SET_LISTOFRELATIVES`
};

export const getRelations = () => ({
  type: types.GET_RELATION
});

export const setRelations = relationships => ({
  type: types.SET_RELATION,
  relationships
});

export const setRelationlist = relationData => ({
  type: types.SET_LISTOFRELATIVES,
  relationData
});

export const saveRelationShip = relationData => ({
  type: types.SAVE_RELATION,
  relationData
});

export const removeRelationShip = relationId => ({
  type: types.REMOVE_RELATION,
  relationId
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_RELATION: {
      return {
        ...state,
        relationships: action.relationships
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
