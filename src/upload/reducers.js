import UploadTypes from "./UploadTypes";

const prefix = "app/bulkUpload/reducer/metadata/";

export const types = {
  SET_UPLOAD_JOB_STATUSES: `${prefix}SET_UPLOAD_JOB_STATUSES`,
  GET_UPLOAD_JOB_STATUSES: `${prefix}GET_UPLOAD_JOB_STATUSES`,
  GET_UPLOAD_TYPES: `${prefix}GET_UPLOAD_TYPES`,
  SET_UPLOAD_TYPES: `${prefix}SET_UPLOAD_TYPES`
};

export const setStatuses = (statuses, page) => ({
  type: types.SET_UPLOAD_JOB_STATUSES,
  statuses,
  page
});

export const getStatuses = page => ({
  type: types.GET_UPLOAD_JOB_STATUSES,
  page
});

export const getUploadTypes = () => ({
  type: types.GET_UPLOAD_TYPES
});

export const setUploadTypes = uploadTypes => ({
  type: types.SET_UPLOAD_TYPES,
  uploadTypes
});

const initialState = {};

// reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_UPLOAD_JOB_STATUSES: {
      return {
        ...state,
        statuses: action.statuses,
        page: action.page
      };
    }
    case types.SET_UPLOAD_TYPES: {
      return {
        ...state,
        uploadTypes: new UploadTypes(action.uploadTypes)
      };
    }
    default:
      return state;
  }
}
