import { map } from "lodash";
import { labelValue } from "../util/util";

export const initialState = {
  metadata: {},
  loaded: false,
  filterCriteria: {
    subjectType: null,
    name: null,
    addressIds: [],
    syncAttribute1: null,
    syncAttribute2: null,
    program: null,
    userGroup: null,
    user: null,
    createdOn: null
  }
};

const clone = state => {
  const newState = {};
  newState.metadata = { ...state.metadata };
  newState.loaded = state.loaded;
  newState.filterCriteria = { ...state.filterCriteria };
  return newState;
};

export const SubjectAssignmentReducer = (state, action) => {
  const newState = clone(state);
  const payload = action.payload;
  switch (action.type) {
    case "setMetadata": {
      newState.metadata = payload;
      newState.loaded = true;
      return newState;
    }
    case "setFilter": {
      const { filter, value } = payload;
      newState.filterCriteria[filter] = value;
      return newState;
    }
    default:
      return newState;
  }
};
export const getMetadataOptions = metadata => {
  const { subjectTypes, programs, users, userGroups } = metadata;
  const subjectOptions = map(subjectTypes, ({ id, name }) => labelValue(name, id));
  //TODO: make program dependenton ST
  const programOptions = map(programs, ({ id, name }) => labelValue(name, id));
  const userOptions = map(users, ({ id, name }) => labelValue(name, id));
  const userGroupOptions = map(userGroups, ({ id, groupName }) => labelValue(groupName, id));
  return { subjectOptions, programOptions, userOptions, userGroupOptions };
};
