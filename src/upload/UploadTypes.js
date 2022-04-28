import { map, findKey, find, get } from "lodash";

export default class {
  constructor(types = {}) {
    this.types = types;
  }

  get names() {
    return map(this.types, n => ({ name: n.name }));
  }

  getName(code) {
    return get(this.types[code], "name");
  }

  getCode(name) {
    return findKey(this.types, n => name === n.name);
  }

  isApprovalEnabled(name) {
    return get(find(this.types, n => n.name === name), "approvalEnabled", false);
  }
}
