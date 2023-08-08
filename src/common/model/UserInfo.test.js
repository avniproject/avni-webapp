import UserInfo from "./UserInfo";
import { Privilege } from "openchs-models";
import { assert } from "chai";

it("should check for all privileges", function() {
  const {
    EditUserGroup,
    EditUserConfiguration,
    EditLocationType,
    EditCatchment
  } = Privilege.PrivilegeType;
  const userPrivileges = [
    { privilegeType: EditUserGroup },
    { privilegeType: EditUserConfiguration },
    { privilegeType: EditLocationType }
  ];
  const userInfo = { privileges: userPrivileges, hasAllPrivileges: false };
  assert.equal(
    UserInfo.hasMultiplePrivileges(userInfo, [EditUserGroup, EditUserConfiguration]),
    true
  );
  assert.equal(UserInfo.hasMultiplePrivileges(userInfo, [EditUserGroup, EditCatchment]), false);
  assert.equal(UserInfo.hasMultiplePrivileges(userInfo, [EditUserGroup]), true);
  assert.equal(UserInfo.hasMultiplePrivileges(userInfo, [EditCatchment]), false);
});
