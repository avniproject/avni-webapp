import IdpFactory from "./IdpFactory";
import IdpDetails from "./IdpDetails";
import NullIdp from "./NullIdp";
import { assert } from "chai";
import LocalStorageLocator from "../../common/utils/LocalStorageLocator";
import StubbedLocalStorage from "./StubbedLocalStorage";
import KeycloakWebClient from "./KeycloakWebClient";
import CognitoWebClient from "./CognitoWebClient";
import UndecidedIdp from "./UndecidedIdp";

it("when not both", function() {
  assert.isTrue(IdpFactory.createIdp(IdpDetails.none, {}) instanceof NullIdp);
  assert.isTrue(IdpFactory.createIdp(IdpDetails.keycloak, {}) instanceof KeycloakWebClient);
  assert.isTrue(IdpFactory.createIdp(IdpDetails.cognito, {}) instanceof CognitoWebClient);
  assert.isTrue(IdpFactory.createIdp(IdpDetails.both, {}) instanceof UndecidedIdp);
});

it("when both but with local storage having keycloak only item", function() {
  LocalStorageLocator.setLocalStorage(
    new StubbedLocalStorage(new Map([[IdpDetails.AuthTokenName, "foo"]]))
  );
  assert.isTrue(IdpFactory.createIdp(IdpDetails.both, {}) instanceof KeycloakWebClient);
});

it("when both but with local storage having cognito item", function() {
  LocalStorageLocator.setLocalStorage(
    new StubbedLocalStorage(
      new Map([
        [CognitoWebClient.AuthStateLocalStorageKey, "foo"],
        [IdpDetails.AuthTokenName, "bar"]
      ])
    )
  );
  assert.isTrue(IdpFactory.createIdp(IdpDetails.both, {}) instanceof CognitoWebClient);
});
