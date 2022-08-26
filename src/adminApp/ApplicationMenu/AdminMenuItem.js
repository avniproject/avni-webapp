import _ from "lodash";
import { MenuItem, ModelGeneral } from "openchs-models";
import { mapAuditFields } from "../components/AuditUtil";

class AdminMenuItem extends MenuItem {
  static fromResource(resource) {
    const adminMenuItem = MenuItem.assignFields(resource, new AdminMenuItem());
    mapAuditFields(resource, adminMenuItem);
    return adminMenuItem;
  }
}

export default AdminMenuItem;
