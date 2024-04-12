import { assert } from "chai";
import WebSubjectType from "./WebSubjectType";
import SubjectTypeFactory from "./SubjectTypeFactory";
import { SubjectTypeType } from "../../adminApp/SubjectType/Types";

it("empty location is recommended for subject type = user", function() {
  const subjectType = SubjectTypeFactory.create({ type: SubjectTypeType.Individual });
  assert.equal(false, subjectType.allowEmptyLocation);
  WebSubjectType.updateType(subjectType, SubjectTypeType.User);
  assert.equal(true, subjectType.allowEmptyLocation);
});
