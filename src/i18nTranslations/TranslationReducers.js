export const types = {
    GET_TRANSLATION: "GET_TRANSLATION",
    SET_TRANSLATION: "SET_TRANSLATION",
    TRANSLATION_DATA: "TRANSLATION_DATA"
};


export const getTranslation = ()=> {
    return { type: types.GET_TRANSLATION }
  };
  
  export const setTranslation = translationData => ({
    type: types.SET_TRANSLATION,
    payload: translationData
  });

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_TRANSLATION: {
      return {
        ...state,
        translationData: action.translationData
      };
    }
    default:
      return state;
  }
}
