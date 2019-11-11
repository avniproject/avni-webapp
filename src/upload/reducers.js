const prefix = "app/bulkUpload/reducer/metadata/";

export const types = {
  SET_UPLOAD_JOB_STATUSES: `${prefix}SET_UPLOAD_JOB_STATUSES`,
  GET_UPLOAD_JOB_STATUSES: `${prefix}GET_UPLOAD_JOB_STATUSES`
};

export const setStatuses = statuses => ({
  type: types.SET_UPLOAD_JOB_STATUSES,
  statuses
});

export const getStatuses = () => ({
  type: types.GET_UPLOAD_JOB_STATUSES
});

const initialState = {};

// reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_UPLOAD_JOB_STATUSES: {
      return {
        ...state,
        statuses: action.statuses
      };
    }
    default:
      return state;
  }
}
