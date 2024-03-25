import _ from "lodash";

class SubjectService {
  constructor() {
    this.subjects = [];
  }

  findByUUID(subjectUuid) {
    if (!_.isNil(subjectUuid)) {
      return this.subjects.find(x => x.uuid === subjectUuid);
    }
  }

  addSubject(subject) {
    this.subjects.push(subject);
  }

  addSubjects(subjects) {
    this.subjects.push(...subjects);
  }
}

export const subjectService = new SubjectService();
