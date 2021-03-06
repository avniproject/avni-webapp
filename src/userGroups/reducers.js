const prefix = "app/userGroup/reducer/metadata/";

export const types = {
  SET_GROUPS: `${prefix}SET_GROUPS`,
  GET_GROUPS: `${prefix}GET_GROUPS`,
  SET_ALL_USERS: `${prefix}SET_ALL_USERS`,
  GET_ALL_USERS: `${prefix}GET_ALL_USERS`,
  SET_GROUP_USERS: `${prefix}SET_GROUP_USERS`,
  GET_GROUP_USERS: `${prefix}GET_GROUP_USERS`,
  SET_GROUP_PRIVILEGE_LIST: `${prefix}SET_GROUP_PRIVILEGE_LIST`,
  GET_GROUP_PRIVILEGE_LIST: `${prefix}GET_GROUP_PRIVILEGE_LIST`,
  GET_ALL_DASHBOARDS: `${prefix}GET_ALL_DASHBOARDS`,
  SET_ALL_DASHBOARDS: `${prefix}SET_ALL_DASHBOARDS`,
  GET_GROUP_DASHBOARDS: `${prefix}GET_GROUP_DASHBOARDS`,
  SET_GROUP_DASHBOARDS: `${prefix}SET_GROUP_DASHBOARDS`
};

export const setGroups = groups => ({
  type: types.SET_GROUPS,
  groups
});

export const getGroups = () => ({
  type: types.GET_GROUPS
});

export const setAllUsers = allUsers => ({
  type: types.SET_ALL_USERS,
  allUsers
});

export const getAllUsers = () => ({
  type: types.GET_ALL_USERS
});

export const getAllDashboards = () => ({
  type: types.GET_ALL_DASHBOARDS
});

export const setAllDashboards = allDashboards => ({
  type: types.SET_ALL_DASHBOARDS,
  allDashboards
});

export const getGroupDashboards = groupId => ({
  type: types.GET_GROUP_DASHBOARDS,
  groupId
});

export const setGroupDashboards = groupDashboards => ({
  type: types.SET_GROUP_DASHBOARDS,
  groupDashboards
});

export const setGroupPrivilegeList = groupPrivilegeList => ({
  type: types.SET_GROUP_PRIVILEGE_LIST,
  groupPrivilegeList
});

export const getGroupPrivilegeList = param => ({
  type: types.GET_GROUP_PRIVILEGE_LIST,
  param: param
});

export const setGroupUsers = groupUsers => ({
  type: types.SET_GROUP_USERS,
  groupUsers
});

export const getGroupUsers = param => ({
  type: types.GET_GROUP_USERS,
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
    case types.SET_ALL_USERS: {
      return {
        ...state,
        allUsers: action.allUsers
      };
    }
    case types.SET_GROUP_PRIVILEGE_LIST: {
      return {
        ...state,
        groupPrivilegeList: action.groupPrivilegeList
      };
    }
    case types.SET_GROUP_USERS: {
      return {
        ...state,
        groupUsers: action.groupUsers
      };
    }
    case types.SET_ALL_DASHBOARDS: {
      return {
        ...state,
        allDashboards: action.allDashboards
      };
    }
    case types.SET_GROUP_DASHBOARDS: {
      return {
        ...state,
        groupDashboards: action.groupDashboards
      };
    }
    default:
      return state;
  }
}
