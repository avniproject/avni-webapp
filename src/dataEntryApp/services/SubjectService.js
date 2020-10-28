class SubjectService {
  constructor() {
    this.subjects = [];
  }

  findByUUID(subjectUuid) {
    if (subjectUuid !== null || subjectUuid !== undefined) {
      return this.subjects.find(x => x.uuid === subjectUuid);
    }
  }

  addSubject(subject) {
    this.subjects.push(subject);
  }
}

export const subjectService = new SubjectService();
