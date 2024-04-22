import { subjectProfileService } from "./SubjectProfileService";

const notSupportedMessage =
  "Not supported. Please see  https://avni.readme.io/docs/writing-rules#types-of-rules-and-their-supportavailability-in-data-entry-app";

class IndividualService {
  getSubjectsInLocation(addressLevel, subjectTypeName) {
    throw Error(notSupportedMessage);
  }

  getSubjectByUUID(uuid) {
    // Makes a call to upsert the subjectProfile entity stored in subjectProfileService
    subjectProfileService.fetchSubjectByUUID(uuid);
    // start polling at an interval until the data is found at the global
    let interval = setInterval(function() {
      if (subjectProfileService.findSubjectByUUID(uuid)) {
        clearInterval(interval);
        console.log(`Fetched the individual with uuid: ${uuid} from backend server`);
      }
    }, 100);
    // Changes might be delayed in-case we have a stale cached value
    return subjectProfileService.getSubjectByUUID(uuid);
  }
}

export const individualService = new IndividualService();
