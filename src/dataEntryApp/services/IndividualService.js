const notSupportedMessage =
  "Not supported. Please see  https://avni.readme.io/docs/writing-rules#types-of-rules-and-their-supportavailability-in-data-entry-app";

class IndividualService {
  getSubjectsInLocation(addressLevel, subjectTypeName) {
    throw Error(notSupportedMessage);
  }

  getSubjectByUUIDe(uuid, subjectTypeName) {
    throw Error(notSupportedMessage);
  }
}

export const individualService = new IndividualService();
