const prefix = "app/dataEntry/reducer/load/";

export const types = {
  SET_LOAD: `${prefix}SET_LOAD`
};

export const setLoad = load => ({
  type: types.SET_LOAD,
  load
});

const initialState = {
  load: false
};

// reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_LOAD: {
      return {
        ...state,
        load: action.load
      };
    }
    default:
      return state;
  }
}
