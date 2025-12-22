import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";

export const canEditConcept = (conceptData, userInfo, organisation) => {
  const hasPrivilege = UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditConcept);

  if (!hasPrivilege) {
    return false;
  }

  const createdByOrg = conceptData.createdBy.split("@")[1];
  return createdByOrg === organisation.usernameSuffix;
};
