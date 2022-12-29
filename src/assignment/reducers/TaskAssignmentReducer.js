import { filter, flatMap, get, isEmpty, map, mapValues, find, isNil } from "lodash";
import { labelValue } from "../util/util";

const initialAssignmentCriteria = {
  taskIds: [],
  assignToUserIds: [],
  statusId: null,
  allSelected: false
};

class TaskMetadata {
  taskStatuses;
  taskTypes;

  static getTaskStatusesMatching(taskMetadata, name) {
    return filter(taskMetadata.taskStatuses, ts => {
      const taskType = find(taskMetadata.taskTypes, tt => ts["taskTypeId"] === tt["id"]);
      return taskType["name"] === name;
    });
  }
}

export const initialState = {
  taskMetadata: {},
  filterCriteria: {
    taskType: null,
    taskStatus: null,
    assignedTo: { label: "Unassigned", value: 0 },
    createdOn: null,
    completedOn: null,
    metadata: {}
  },
  displayAction: false,
  assignmentCriteria: initialAssignmentCriteria,
  saving: false,
  applyableTaskStatuses: []
};

const clone = state => {
  const newState = {};
  newState.taskMetadata = { ...state.taskMetadata };
  newState.filterCriteria = { ...state.filterCriteria };
  newState.displayAction = state.displayAction;
  newState.assignmentCriteria = { ...state.assignmentCriteria };
  newState.saving = state.saving;
  newState.applyableTaskStatuses = [...state.applyableTaskStatuses];
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
    case "setMetadataFilter": {
      const { filter, value } = payload;
      newState.filterCriteria.metadata[filter] = value;
      return newState;
    }
    case "displayAction": {
      const { selectedIds, display, selectedTaskTypeNames } = payload;
      newState.displayAction = display;
      newState.assignmentCriteria["taskIds"] = selectedIds;
      newState.applyableTaskStatuses =
        selectedTaskTypeNames.length === 1
          ? TaskMetadata.getTaskStatusesMatching(newState.taskMetadata, selectedTaskTypeNames[0])
          : [];
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

export const getMetadataOptions = (taskMetadata, filterCriteria) => {
  const taskTypeOptions = map(taskMetadata.taskTypes, ({ name, id }) => labelValue(name, id));
  const userOptions = map(taskMetadata.users, ({ name, id }) => labelValue(name, id));
  const applicableTaskStatuses = filter(
    taskMetadata.taskStatuses,
    ({ taskTypeId }) =>
      taskTypeId === get(filterCriteria.taskType, "value") || isNil(filterCriteria.taskType)
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

export const getFilterPayload = filterCriteria => {
  const filterCriteriaValues = mapValues(filterCriteria, value => get(value, "value", null));
  filterCriteriaValues.metadata = map(filterCriteria.metadata, (v, k) => ({
    conceptName: k,
    value: v
  })).filter(({ value }) => !isEmpty(value));
  return filterCriteriaValues;
};
