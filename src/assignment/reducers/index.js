import { filter, flatMap, get, map } from "lodash";

const initialAssignmentCriteria = {
  taskIds: [],
  assignToUserIds: [],
  statusId: null,
  assignToUserId: null,
  allSelected: false
};

export const initialState = {
  taskMetadata: {},
  filterCriteria: {
    taskType: null,
    taskStatus: null,
    assignedTo: null, //{label: 'Unassigned', value: 0}
    createdOn: null,
    completedOn: null
  },
  displayAction: false,
  assignmentCriteria: initialAssignmentCriteria,
  saving: false
};

const clone = state => {
  const newState = {};
  newState.taskMetadata = { ...state.taskMetadata };
  newState.filterCriteria = { ...state.filterCriteria };
  newState.displayAction = state.displayAction;
  newState.assignmentCriteria = { ...state.assignmentCriteria };
  newState.saving = state.saving;
  return newState;
};

export const TaskAssignmentReducer = (state, action) => {
  const newState = clone(state);
  const payload = action.payload;
  switch (action.type) {
    case "setData": {
      newState.taskMetadata = payload;
      return newState;
    }
    case "setFilter": {
      const { filter, value } = payload;
      newState.filterCriteria[filter] = value;
      return newState;
    }
    case "displayAction": {
      const { selectedIds, display } = payload;
      newState.displayAction = display;
      newState.assignmentCriteria["taskIds"] = selectedIds;
      return newState;
    }
    case "hideAction": {
      newState.displayAction = false;
      newState.assignmentCriteria = initialAssignmentCriteria;
      return newState;
    }
    case "setAction": {
      const { key, value } = payload;
      newState.assignmentCriteria[key] = value;
      return newState;
    }
    case "onSave": {
      const { saveStart } = payload;
      newState.saving = saveStart;
      return newState;
    }
    default:
      return newState;
  }
};

export const labelValue = (label, value) => ({ label, value });

export const getMetadataOptions = (taskMetadata, filterCriteria) => {
  const taskTypeOptions = map(taskMetadata.taskTypes, ({ name, id }) => labelValue(name, id));
  const userOptions = map(taskMetadata.users, ({ name, id }) => labelValue(name, id));
  const applicableTaskStatuses = filter(
    taskMetadata.taskStatuses,
    ({ taskTypeId }) => taskTypeId === get(filterCriteria.taskType, "value")
  );
  const taskStatusOptions = map(applicableTaskStatuses, ({ name, id }) => labelValue(name, id));
  return { taskTypeOptions, userOptions, taskStatusOptions };
};

export const getAllSearchFields = taskMetadata => {
  return flatMap(taskMetadata.taskTypes, ({ metadataSearchFields }) => metadataSearchFields);
};

export const getAssignmentValue = (key, assignmentCriteria) => {
  if (key === "assignToUserIds") {
    return map(assignmentCriteria[key], kv => get(kv, "value"));
  }
  return get(assignmentCriteria[key], "value", null);
};
