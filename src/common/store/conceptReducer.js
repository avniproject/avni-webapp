export const types = {
  ADD_CONCEPT: `ADD_CONCEPT`
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
    default:
      return state;
  }
}
