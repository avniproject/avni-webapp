import { map, findKey } from "lodash";

export default class {
  constructor(types = {}) {
    this.types = types;
  }

  get names() {
    return map(this.types, name => ({ name }));
  }

  getName(code) {
    return this.types[code];
  }

  getCode(name) {
    return findKey(this.types, n => name === n);
  }
}
