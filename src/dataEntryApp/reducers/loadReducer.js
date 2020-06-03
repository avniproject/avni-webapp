const prefix = "app/dataEntry/reducer/load/";

export const types = {
  SET_LOAD: `${prefix}SET_LOAD`
  //   SET_LOAD_ERROR: `${prefix}SET_LOAD_ERROR`
};

export const setLoad = load => ({
  type: types.SET_LOAD,
  load
});

// export const setLoadError = () => ({
//     type: types.SET_LOAD_ERROR
// });

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
    // case types.SET_LOAD_ERROR: {
    //   return {
    //     ...state,
    //     loaded: false
    //   };
    // }
    default:
      return state;
  }
}
