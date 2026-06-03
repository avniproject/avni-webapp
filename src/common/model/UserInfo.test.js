import UserInfo from "./UserInfo";
import { Privilege } from "openchs-models";
import { assert } from "chai";

it("should check for all privileges", function () {
  const { EditUserGroup, EditUserConfiguration, EditLocationType, EditCatchment } = Privilege.PrivilegeType;
  const userPrivileges = [{ privilegeType: EditUserGroup }, { privilegeType: EditUserConfiguration }, { privilegeType: EditLocationType }];
  const userInfo = { privileges: userPrivileges, hasAllPrivileges: false };
  assert.equal(UserInfo.hasMultiplePrivileges(userInfo, [EditUserGroup, EditUserConfiguration]), true);
  assert.equal(UserInfo.hasMultiplePrivileges(userInfo, [EditUserGroup, EditCatchment]), false);
  assert.equal(UserInfo.hasMultiplePrivileges(userInfo, [EditUserGroup]), true);
  assert.equal(UserInfo.hasMultiplePrivileges(userInfo, [EditCatchment]), false);
});

describe("hasPrivilegeForSubjectType", () => {
  const { EditSubject } = Privilege.PrivilegeType;
  const studentUuid = "subject-type-student-uuid";
  const teacherUuid = "subject-type-teacher-uuid";

  it("returns true when the user has the privilege scoped to that subjectType uuid", () => {
    const userInfo = {
      hasAllPrivileges: false,
      privileges: [{ privilegeType: EditSubject, subjectType: { uuid: studentUuid, name: "Student" } }],
    };
    assert.equal(UserInfo.hasPrivilegeForSubjectType(userInfo, EditSubject, studentUuid), true);
  });

  it("returns false when the privilege is scoped to a different subjectType uuid", () => {
    const userInfo = {
      hasAllPrivileges: false,
      privileges: [{ privilegeType: EditSubject, subjectType: { uuid: teacherUuid, name: "Teacher" } }],
    };
    assert.equal(UserInfo.hasPrivilegeForSubjectType(userInfo, EditSubject, studentUuid), false);
  });

  it("returns true when hasAllPrivileges, regardless of scope", () => {
    const userInfo = { hasAllPrivileges: true, privileges: [] };
    assert.equal(UserInfo.hasPrivilegeForSubjectType(userInfo, EditSubject, studentUuid), true);
  });

  it("returns false when userInfo or subjectTypeUuid is missing", () => {
    assert.equal(UserInfo.hasPrivilegeForSubjectType(null, EditSubject, studentUuid), false);
    assert.equal(UserInfo.hasPrivilegeForSubjectType({ hasAllPrivileges: false, privileges: [] }, EditSubject, null), false);
  });
});
