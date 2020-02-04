let concepts = [];
export function setDataReduxSate(state = {}, action) {
  console.log(action);
  if (typeof state === "undefined") {
    return 0;
  } 
  switch (action.type) {
    case "INCREMENT":
        concepts.push(action.json);
       return {
          ...state,
        concept:concepts
      }
    default:
      return state;
  }
}
