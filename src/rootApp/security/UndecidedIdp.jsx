import BaseIdp from "./BaseIdp";
import IdpDetails from "./IdpDetails";

class UndecidedIdp extends BaseIdp {
  get idpType() {
    return IdpDetails.both;
  }
}

export default UndecidedIdp;
