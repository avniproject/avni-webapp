export const types = {
  ADD_CONCEPT: `ADD_CONCEPT`,
  ADD_ENROLLDATA: "ADD_ENROLLDATA"
};

let concepts = [];

export function conceptReducer(state = {}, action) {
  switch (action.type) {
    case types.ADD_CONCEPT:
      concepts.push(action.value);
      return {
        ...state,
        concepts: concepts
      };

    case types.ADD_ENROLLDATA: {
      return {
        ...state,
        enrolldata: action.value
      };
    }
    default:
      return state;
  }
}
