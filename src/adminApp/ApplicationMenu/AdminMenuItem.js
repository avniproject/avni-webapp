import { MenuItem } from "openchs-models";
import { mapAuditFields } from "../components/AuditUtil";
import _ from "lodash";

class AdminMenuItem extends MenuItem {
  static VAL_DISPLAY_KEY = "valDisplayKey";
  static VAL_GROUP = "valGroup";
  static VAL_TYPE = "valType";

  static fromResource(resource) {
    const adminMenuItem = MenuItem.assignFields(resource, new AdminMenuItem());
    mapAuditFields(resource, adminMenuItem);
    return adminMenuItem;
  }

  validate() {
    const errors = new Map();
    if (_.isEmpty(this.displayKey))
      errors.set(AdminMenuItem.VAL_DISPLAY_KEY, "Display key is mandatory");
    if (_.isEmpty(this.group)) errors.set(AdminMenuItem.VAL_GROUP, "Group is mandatory");
    if (_.isEmpty(this.type)) errors.set(AdminMenuItem.VAL_TYPE, "Type is mandatory");
    return errors;
  }

  clone() {
    const clone = MenuItem.assignFields(this, new AdminMenuItem());
    mapAuditFields(this, clone);
    return clone;
  }
}

export default AdminMenuItem;
