import _ from "lodash";

class SubjectService {
  constructor() {
    this.subjects = new Map();
  }

  findByUUID(subjectUuid) {
    if (!_.isNil(subjectUuid)) {
      return this.subjects.get(subjectUuid);
    }
  }

  addSubject(subject) {
    this.subjects.set(subject.uuid, subject);
  }

  addSubjects(subjects) {
    subjects.reduce((acc, subject) => acc.set(subject.uuid, subject), this.subjects);
  }
}

export const subjectService = new SubjectService();
