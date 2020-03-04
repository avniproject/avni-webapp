export const types = {
  OBSERVATIONS_VALUE: `OBSERVATIONS_VALUE`,
  TRANSLATION_DATA: `TRANSLATION_DATA`
};

let concepts = [];
let translations =[];
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
      case types.TRANSLATION_DATA:
        translations.push(action.value)
        return {
          ...state,
          translations: translations
        };
    default:
      return state;
  }
}
