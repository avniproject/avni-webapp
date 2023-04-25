//@deprecated wrong use of service
class ConceptService {
  constructor() {
    this.concepts = [];
  }

  getConceptByUUID(conceptUuid) {
    if (conceptUuid !== null) {
      return this.concepts.find(x => x.uuid === conceptUuid);
    }
  }

  addConcept(concept) {
    this.concepts.push(concept);
  }
}

export const conceptService = new ConceptService();

export class i18n {
  t(concept) {
    return concept;
  }
}
