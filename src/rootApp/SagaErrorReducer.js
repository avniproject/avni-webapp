const prefix = "app/reducer/SagaErrorReducer/";

export const types = {
  SET_ERROR_RAISED: `${prefix}SET_ERROR_RAISED`,
  RESET_ERROR_RAISED: `${prefix}RESET_ERROR_RAISED`
};

const initialState = { errorRaised: false, error: null };

export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_ERROR_RAISED: {
      const { error, resetErrorCB } = action.payload;
      return {
        ...state,
        errorRaised: true,
        error,
        resetErrorCB
      };
    }
    case types.RESET_ERROR_RAISED: {
      return {
        ...state,
        errorRaised: false
      };
    }
    default:
      return state;
  }
}
