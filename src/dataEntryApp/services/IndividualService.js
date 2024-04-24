import { subjectProfileService } from "./SubjectProfileService";
const notSupportedMessage =
  "Not supported. Please see  https://avni.readme.io/docs/writing-rules#types-of-rules-and-their-supportavailability-in-data-entry-app";

class IndividualService {
  getSubjectsInLocation(addressLevel, subjectTypeName) {
    throw Error(notSupportedMessage);
  }

  /**
   * We are attempting to synchronously fetch cached subjectProfile values which are upserted using async API calls.
   * Therefore, the first few calls might return nulls till the api response value is persisted in the cache.
   * @param uuid
   * @returns {*}
   */
  getSubjectByUUID(uuid) {
    // Makes an async call to upsert the subjectProfile entity stored in subjectProfileService
    subjectProfileService.getDebouncedFetchSubjectByUUIDFunc(uuid);
    // Attempts to fetch the subjectProfile value that might have been previously cached
    return subjectProfileService.getSubjectByUUID(uuid);
  }
}

export const individualService = new IndividualService();
