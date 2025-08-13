import { subjectProfileService } from "./SubjectProfileService";
import { subjectService } from "./SubjectService";

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
  getSubjectByUUID(uuid, returnFromSearchResultCache = false) {
    /**
     * This is to be used, only in-case there are quick validations to be done
     * as part of a SubjectSelectFormElement rule, on following fields:
     *
     * id,uuid,firstName,middleName,lastName,fullName,profilePicture,addressLevel(titleLineageString)
     *
     */
    if (returnFromSearchResultCache) {
      return subjectService.findByUUID(uuid);
    }
    // Makes an async call to upsert the subjectProfile entity stored in subjectProfileService
    subjectProfileService.getDebouncedFetchSubjectByUUIDFunc(uuid);
    // Attempts to fetch the subjectProfile value that might have been previously cached
    return subjectProfileService.getSubjectByUUID(uuid);
  }

  findAllSubjectsWithMobileNumberForType(mobileNumber, subjectTypeUUID) {
    throw Error(notSupportedMessage);
  }

  getSubjects(subjectTypeName, realmFilter) {
    throw Error(notSupportedMessage);
  }
}

export const individualService = new IndividualService();
