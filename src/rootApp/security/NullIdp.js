import { devEnvUserName } from "../../common/constants";
import BaseIdp from "./BaseIdp";
import IdpDetails from "./IdpDetails";

class NullIdp extends BaseIdp {
  updateRequestWithSession() {}

  getToken() {
    return `user-name=${devEnvUserName}`;
  }

  get idpType() {
    return IdpDetails.none;
  }
}

export default NullIdp;
