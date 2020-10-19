class ConceptService {
  constructor() {
    this.concepts = [];
  }

  getConceptByUUID(conceptUuid) {
    if (conceptUuid !== null || conceptUuid !== undefined) {
      let concept = this.concepts.find(x => x.uuid === conceptUuid);
      return concept;
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
