export const types = {
  ADD_CONCEPT: `ADD_CONCEPT`
};

let concepts = [];
export function setDataReduxSate(state = {}, action) {
  if (typeof state === "undefined") {
    return 0;
  }
  switch (action.type) {
    case types.ADD_CONCEPT:
      concepts.push(action.value);
      return {
        ...state,
        concept: concepts
      };
    default:
      return state;
  }
}
