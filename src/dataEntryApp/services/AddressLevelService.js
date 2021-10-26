import { isEmpty } from "lodash";

class AddressLevelService {
  constructor() {
    this.addressLevels = [];
  }

  findByUUID(addressLevelUuid) {
    if (!isEmpty(addressLevelUuid)) {
      return this.addressLevels.find(x => x.uuid === addressLevelUuid);
    }
  }

  addAddressLevel(addressLevel) {
    this.addressLevels.push(addressLevel);
  }
}

export const addressLevelService = new AddressLevelService();
