const prefix = "app/reports/reducer/metadata/";

export const types = {
  SET_UPLOAD_JOB_STATUSES: `${prefix}SET_UPLOAD_JOB_STATUSES`,
  GET_UPLOAD_JOB_STATUSES: `${prefix}GET_UPLOAD_JOB_STATUSES`,
  SET_OPERATIONAL_MODULES: `${prefix}SET_OPERATIONAL_MODULES`,
  GET_OPERATIONAL_MODULES: `${prefix}GET_OPERATIONAL_MODULES`
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

const initialState = {};

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
    default:
      return state;
  }
}
