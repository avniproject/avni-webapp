import { httpClient as http } from "../../common/utils/httpClient";
import AdminMenuItem from "../ApplicationMenu/AdminMenuItem";

const menuItemEndpoint = "/web/menuItem";

class ApplicationMenuService {
  static getMenuItem(id) {
    return http.getData(`${menuItemEndpoint}/${id}`).then(result => AdminMenuItem.fromResource(result));
  }

  static getMenuList() {
    return http.getPageData("menuItemWebResponses", menuItemEndpoint);
  }

  static put(menuItem) {
    return http.put(`${menuItemEndpoint}/${menuItem.id}`, menuItem);
  }

  static post(menuItem) {
    return http.post(menuItemEndpoint, menuItem);
  }
}

export default ApplicationMenuService;
