export const types = {
  OBSERVATIONS_VALUE: `OBSERVATIONS_VALUE`
};

let concepts = [];
export function setDataReduxSate(state = {}, action) {
  console.log(action);
  if (typeof state === "undefined") {
    return 0;
  }
  switch (action.type) {
    case types.OBSERVATIONS_VALUE:
      concepts.push(action.value);
      return {
        ...state,
        concept: concepts
      };
    default:
      return state;
  }
}
