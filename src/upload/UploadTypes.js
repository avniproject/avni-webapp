import { map, findKey, find, get, pickBy } from "lodash";

export default class {
  constructor(types = {}) {
    this.types = pickBy(types, (type) => !type.voided);
  }

  get names() {
    return map(this.types, (n) => ({ name: n.name }));
  }

  getName(code) {
    return get(this.types[code], "name");
  }

  getCode(name) {
    return findKey(this.types, (n) => name === n.name);
  }

  isApprovalEnabled(name) {
    return get(
      find(this.types, (n) => n.name === name),
      "approvalEnabled",
      false,
    );
  }
}
