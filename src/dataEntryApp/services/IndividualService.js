class IndividualService {
  getSubjectsInLocation(addressLevel, subjectTypeName) {
    throw Error("getSubjectsInLocation method is not supported for DEA");
  }

  getSubjectByUUIDAndType(uuid, subjectTypeName) {
    throw Error("getSubjectByUUIDAndType method is not supported for DEA");
  }
}

export const individualService = new IndividualService();
