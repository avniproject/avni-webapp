const prefix = "app/dataEntry/reducer/search/";

export const types = {
  SET_SUBJECTS: `${prefix}SET_SUBJECTS`,
  SET_SUBJECT_SEARCH_PARAMS: `${prefix}SET_SUBJECT_SEARCH_PARAMS`,
  SEARCH_SUBJECTS: `${prefix}SEARCH_SUBJECTS`
};

export const setSubjects = subjects => ({
  type: types.SET_SUBJECTS,
  subjects
});

export const searchSubjects = () => ({
  type: types.SEARCH_SUBJECTS
});

export const setSubjectSearchParams = params => ({
  type: types.SET_SUBJECT_SEARCH_PARAMS,
  params
});

const initialState = {
  subjects: [],
  subjectSearchParams: {}
};

// reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_SUBJECTS: {
      return {
        ...state,
        subjects: action.subjects
      };
    }
    case types.SET_SUBJECT_SEARCH_PARAMS: {
      return {
        ...state,
        subjectSearchParams: {
          ...state.subjectSearchParams,
          ...action.params
        }
      };
    }
    default:
      return state;
  }
}
