const prefix = "app/dataEntry/reducer/programs/";

export const types = {
  GET_PROGRAMS: `${prefix}GET_PROGRAMS`,
  SET_PROGRAMS: `${prefix}SET_PROGRAMS`
};

export const getPrograms = () => ({
  type: types.GET_PROGRAMS
});

export const setPrograms = programs => ({
  type: types.SET_PROGRAMS,
  programs
});

export default function(state = {}, action) {
  switch (action.type) {
    case types.SET_PROGRAMS: {
      return {
        ...state,
        programs: action.programs
      };
    }
    default:
      return state;
  }
}
