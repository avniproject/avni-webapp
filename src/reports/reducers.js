import _ from "lodash";

const prefix = "app/reports/reducer/metadata/";

export const types = {
  SET_UPLOAD_JOB_STATUSES: `${prefix}SET_UPLOAD_JOB_STATUSES`,
  GET_UPLOAD_JOB_STATUSES: `${prefix}GET_UPLOAD_JOB_STATUSES`,
  SET_OPERATIONAL_MODULES: `${prefix}SET_OPERATIONAL_MODULES`,
  GET_OPERATIONAL_MODULES: `${prefix}GET_OPERATIONAL_MODULES`,
  GET_ACTIVITY_REPORT: `${prefix}GET_ACTIVITY_REPORT`,
  SET_ACTIVITY_REPORT: `${prefix}SET_ACTIVITY_REPORT`
};

export const setUploadStatus = exportJobStatuses => ({
  type: types.SET_UPLOAD_JOB_STATUSES,
  exportJobStatuses
});

export const getUploadStatuses = page => ({
  type: types.GET_UPLOAD_JOB_STATUSES,
  page
});

export const setOperationalModules = operationalModules => ({
  type: types.SET_OPERATIONAL_MODULES,
  operationalModules
});

export const getOperationalModules = () => ({
  type: types.GET_OPERATIONAL_MODULES
});

export const getActivityReport = () => ({
  type: types.GET_ACTIVITY_REPORT
});

export const setActivityReport = activityReport => ({
  type: types.SET_ACTIVITY_REPORT,
  activityReport
});

const initialState = { operationalModules: {} };

// reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_UPLOAD_JOB_STATUSES: {
      return {
        ...state,
        exportJobStatuses: action.exportJobStatuses
      };
    }
    case types.SET_OPERATIONAL_MODULES: {
      return {
        ...state,
        operationalModules: action.operationalModules
      };
    }
    case types.SET_ACTIVITY_REPORT: {
      return {
        ...state,
        activityReport: action.activityReport
      };
    }
    default:
      if (_.get(action, "payload.error")) {
        console.log(action.payload.error);
      }
      return state;
  }
}

export const selectOperationalModules = state => state.reports.operationalModules;
