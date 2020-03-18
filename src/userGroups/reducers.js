const prefix = "app/userGroup/reducer/metadata/";

export const types = {
  SET_GROUPS: `${prefix}SET_GROUPS`,
  GET_GROUPS: `${prefix}GET_GROUPS`,
  SET_GROUP_DETAILS: `${prefix}SET_GROUP_DETAILS`,
  GET_GROUP_DETAILS: `${prefix}GET_GROUP_DETAILS`
};

export const setGroups = groups => ({
  type: types.SET_GROUPS,
  groups
});

export const getGroups = () => ({
  type: types.GET_GROUPS
});

export const setGroupDetails = groupDetails => ({
  type: types.SET_GROUP_DETAILS,
  groupDetails
});

export const getGroupDetails = param => ({
  type: types.GET_GROUP_DETAILS,
  param: param
});

const initialState = {};

// reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_GROUPS: {
      return {
        ...state,
        groups: action.groups
      };
    }
    case types.SET_GROUP_DETAILS: {
      return {
        ...state,
        groupDetails: action.groupDetails
      };
    }
    default:
      return state;
  }
}
