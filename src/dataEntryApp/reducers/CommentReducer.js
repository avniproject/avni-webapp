const prefix = "app/dataEntry/reducer/comment/";

export const types = {
  GET_COMMENT_THREADS: `${prefix}GET_COMMENT_THREADS`,
  SET_COMMENT_THREADS: `${prefix}SET_COMMENT_THREADS`,
  SET_LOADING: `${prefix}SET_LOADING`,
  ON_NEW_THREAD: `${prefix}ON_NEW_THREAD`,
  ON_REPLY: `${prefix}ON_REPLY`,
  ON_RESOLVE: `${prefix}ON_RESOLVE`,
  ON_DELETE: `${prefix}ON_DELETE`,
  ON_EDIT: `${prefix}ON_EDIT`,
  SET_LOAD_COMMENT_LISTING: `${prefix}SET_LOAD_COMMENT_LISTING`,
  SET_COMMENTS: `${prefix}SET_COMMENTS`,
  ON_NEW_COMMENT: `${prefix}ON_NEW_COMMENT`,
  SET_ACTIVE_THREAD: `${prefix}SET_ACTIVE_THREAD`,
  SET_NEW_COMMENT_TEXT: `${prefix}SET_NEW_COMMENT`
};

const initialState = {
  loading: true,
  loadCommentListing: false,
  commentThreads: [],
  comments: [],
  activeThread: undefined,
  newCommentText: ""
};

export const setNewCommentText = newCommentText => ({
  type: types.SET_NEW_COMMENT_TEXT,
  newCommentText
});

export const setActiveThread = thread => ({
  type: types.SET_ACTIVE_THREAD,
  thread
});

export const addNewComment = subjectUUID => ({
  type: types.ON_NEW_COMMENT,
  subjectUUID
});

export const setComments = comments => ({
  type: types.SET_COMMENTS,
  comments
});

export const setLoadCommentListing = loadCommentListing => ({
  type: types.SET_LOAD_COMMENT_LISTING,
  loadCommentListing
});

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

export const onNewThread = (text, subjectUUID) => ({
  type: types.ON_NEW_THREAD,
  text,
  subjectUUID
});

export const onThreadReply = threadId => ({
  type: types.ON_REPLY,
  threadId
});

export const onThreadResolve = () => ({
  type: types.ON_RESOLVE
});

export const onCommentDelete = commentId => ({
  type: types.ON_DELETE,
  commentId
});

export const onCommentEdit = (comment, newCommentText) => ({
  type: types.ON_EDIT,
  comment,
  newCommentText
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
    case types.SET_LOAD_COMMENT_LISTING: {
      return {
        ...state,
        loadCommentListing: action.loadCommentListing
      };
    }
    case types.SET_COMMENTS: {
      return {
        ...state,
        comments: action.comments
      };
    }
    case types.SET_ACTIVE_THREAD: {
      return {
        ...state,
        activeThread: action.thread
      };
    }
    case types.SET_NEW_COMMENT_TEXT: {
      return {
        ...state,
        newCommentText: action.newCommentText
      };
    }
    default:
      return state;
  }
}

export const selectCommentState = state => state.dataEntry.comment;

export const selectDisplayUsername = state => {
  const { username, name } = state.app.authSession;
  return name || username;
};
