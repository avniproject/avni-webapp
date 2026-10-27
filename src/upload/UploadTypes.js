import { map, findKey, find, get } from "lodash";

export default class {
  constructor(types = {}) {
    this.types = types;
  }

  get names() {
    return map(this.types, (typeDef, code) => ({
      name: typeDef.name,
      voided: Boolean(typeDef.voided || typeDef.isVoided),
      code,
    })).filter(({ name, voided, code }) => {
      if (voided) return false;
      const safeName = String(name || "");
      const safeCode = String(code || "");
      return !/\bvoided\b/i.test(safeName) && !/\bvoided\b/i.test(safeCode);
    });
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
