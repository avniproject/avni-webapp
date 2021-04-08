const prefix = "app/dataEntry/reducer/comment/";

export const types = {
  GET_COMMENT_THREADS: `${prefix}GET_COMMENT_THREADS`,
  SET_COMMENT_THREADS: `${prefix}SET_COMMENT_THREADS`,
  SET_LOADING: `${prefix}SET_LOADING`
};

const initialState = {
  loading: true,
  commentThreads: []
};

export const getCommentThreads = subjectUUID => ({
  type: types.GET_COMMENT_THREADS,
  subjectUUID
});

export const setCommentThreads = commentThreads => ({
  type: types.SET_COMMENT_THREADS,
  commentThreads
});

export const setLoading = loading => ({
  type: types.SET_LOADING,
  loading
});

export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_COMMENT_THREADS: {
      return {
        ...state,
        commentThreads: action.commentThreads
      };
    }
    case types.SET_LOADING: {
      return {
        ...state,
        loading: action.loading
      };
    }
    default:
      return state;
  }
}

export const selectCommentState = state => state.dataEntry.comment;
