import { testSaga } from "redux-saga-test-plan";
import { onSetCognitoUser } from "./saga";
import { types, getUserInfo } from "./ducks";
import { httpClient } from "common/utils/httpClient";

const setCognitoAction = {
  type: types.SET_COGNITO_USER,
  payload: {
    authData: {
      username: "abc",
      signInUserSession: { idToken: { jwtToken: "e23d23d2dt5g5hj67" } }
    }
  }
};

it("set Cognito user", () => {
  testSaga(onSetCognitoUser)
    .next()
    .take(types.SET_COGNITO_USER)
    .next(setCognitoAction)
    .call(httpClient.initAuthContext, {
      username: setCognitoAction.payload.authData.username,
      idToken: setCognitoAction.payload.authData.signInUserSession.idToken.jwtToken
    })
    .next()
    .put(getUserInfo())
    .next()
    .isDone();
});
