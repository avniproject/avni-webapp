const prefix = "app/dataEntry/reducer/msgs/";

export const types = {
  GET_MSGS_SENT: `${prefix}GET_MSGS_SENT`,
  GET_MSGS_NOT_YET_SENT: `${prefix}GET_MSGS_NOT_YET_SENT`,
  SET_MSGS_SENT: `${prefix}SET_MSGS_SENT`,
  SET_MSGS_NOT_YET_SENT: `${prefix}SET_MSGS_NOT_YET_SENT`,
  SET_MSGS_SENT_AVAILABLE: `${prefix}SET_MSGS_SENT_AVAILABLE`,
  SET_MSGS_NOT_YET_SENT_AVAILABLE: `${prefix}SET_MSGS_NOT_YET_SENT_AVAILABLE`
};

export const getMsgsSent = subjectID => ({
  type: types.GET_MSGS_SENT,
  subjectID
});

export const setMsgsSent = msgsSent => ({
  type: types.SET_MSGS_SENT,
  msgsSent
});

export const setMsgsSentAvailable = isMsgsSentAvailable => ({
  type: types.SET_MSGS_SENT_AVAILABLE,
  isMsgsSentAvailable
});

export const getMsgsNotYetSent = subjectID => ({
  type: types.GET_MSGS_NOT_YET_SENT,
  subjectID
});

export const setMsgsNotYetSent = msgsNotYetSent => ({
  type: types.SET_MSGS_NOT_YET_SENT,
  msgsNotYetSent
});

export const setMsgsNotYetSentAvailable = isMsgsNotYetSentAvailable => ({
  type: types.SET_MSGS_NOT_YET_SENT_AVAILABLE,
  isMsgsNotYetSentAvailable
});

const initialState = {
  msgsSent: [],
  msgsNotYetSent: [],
  isMsgsSentAvailable: false,
  isMsgsNotYetSentAvailable: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_MSGS_SENT: {
      return {
        ...state,
        msgsSent: action.msgsSent
      };
    }
    case types.SET_MSGS_SENT_AVAILABLE: {
      return {
        ...state,
        isMsgsSentAvailable: action.isMsgsSentAvailable
      };
    }
    case types.SET_MSGS_NOT_YET_SENT: {
      return {
        ...state,
        msgsNotYetSent: action.msgsNotYetSent
      };
    }
    case types.SET_MSGS_NOT_YET_SENT_AVAILABLE: {
      return {
        ...state,
        isMsgsNotYetSentAvailable: action.isMsgsNotYetSentAvailable
      };
    }
    default:
      return state;
  }
}

export const selectIsMsgsSentAvailable = state => state.dataEntry.msgs.isMsgsSentAvailable;
export const selectIsMsgsNotYetSentAvailable = state =>
  state.dataEntry.msgs.isMsgsNotYetSentAvailable;
export const selectMsgsSent = state => state.dataEntry.msgs.msgsSent;
export const selectMsgsNotYetSent = state => state.dataEntry.msgs.msgsNotYetSent;
