import * as t from './actionTypes';

const initialState = {
    awsConfig: {},
    user: {
        authState: undefined,
        cognito: undefined
    }
};

export default function(state=initialState, action) {
    switch(action.type) {
        case t.SET_AWS_CONFIG: {
          return {
            ...state,
            awsConfig: action.payload
          }
        }
        case t.SET_COGNITO_USER: {
          return {
            ...state,
            user: {
                authState: action.payload.authState,
                cognito: action.payload.authData,
                userName: action.payload.authData.username
            }
          }
        }
        case t.SET_USER_INFO: {
          return {
              ...state,
              user: {
                  ...state.user,
                  orgName: action.payload
              }
          }
        }
        default:
          return state;
    }
}
