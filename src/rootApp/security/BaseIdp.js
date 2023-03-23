class BaseIdp {
  constructor(idpDetails) {
    this.idpDetails = idpDetails;
  }

  get idpType() {
    return this.idpDetails.idpType;
  }
}

export default BaseIdp;
