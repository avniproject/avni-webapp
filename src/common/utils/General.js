import moment from "moment";
import { ROLES } from "../constants";

export const formatDate = aDate => (aDate ? moment(aDate).format("DD-MM-YYYY") : "-");

export const isAnyAdmin = userRoles =>
  userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.ORG_ADMIN);
