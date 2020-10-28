class AddressLevelService {
  constructor() {
    this.addressLevels = [];
  }

  findByUUID(addressLevelUuid) {
    if (addressLevelUuid !== null || addressLevelUuid !== undefined) {
      return this.addressLevels.find(x => x.uuid === addressLevelUuid);
    }
  }

  addAddressLevel(addressLevel) {
    this.addressLevels.push(addressLevel);
  }
}

export const addressLevelService = new AddressLevelService();
