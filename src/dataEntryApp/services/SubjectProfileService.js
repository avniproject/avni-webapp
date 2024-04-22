import api from "../api";
import { mapProfile } from "../../common/subjectModelMapper";

class SubjectProfileService {
  constructor() {
    this.subjectProfiles = new Map();
  }

  getSubjectByUUID(subjectUuid) {
    return this.subjectProfiles.get(subjectUuid);
  }

  findSubjectByUUID(subjectUuid) {
    return this.subjectProfiles.has(subjectUuid);
  }

  /**
   * Makes a call to upsert the subjectProfile entity stored in subjectProfileService for that subjectUuid.
   */
  fetchSubjectByUUID(subjectUuid) {
    api
      .fetchSubjectProfile(subjectUuid)
      .then(subjectProfileJson => {
        const subjectProfile = mapProfile(subjectProfileJson);
        this.addSubject(subjectUuid, subjectProfile);
      })
      .catch(error => {
        console.error(`Failed to fetch latest value of the individual from backend server for uuid: ${subjectUuid} Error: ${error}`);
        throw error;
      });
  }

  addSubject(uuid, subject) {
    this.subjectProfiles.set(uuid, subject);
  }
}

export const subjectProfileService = new SubjectProfileService();
