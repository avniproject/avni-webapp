import { SubjectType } from "openchs-models";

class SubjectTypeFactory {
  static create({ uuid, name, type, allowEmptyLocation = false }) {
    const subjectType = new SubjectType();
    subjectType.uuid = uuid;
    subjectType.name = name;
    subjectType.type = type;
    subjectType.allowEmptyLocation = allowEmptyLocation;
    return subjectType;
  }
}

export default SubjectTypeFactory;
