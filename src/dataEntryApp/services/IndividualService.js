class IndividualService {
  getSubjectsInLocation(addressLevel, subjectTypeName) {
    throw Error("getSubjectsInLocation method is not supported for DEA");
  }

  getSubjectByUUIDe(uuid, subjectTypeName) {
    throw Error("getSubjectByUUID method is not supported for DEA");
  }
}

export const individualService = new IndividualService();
