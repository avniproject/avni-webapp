import { store } from "../../common/utils/reduxStoreUtilty";

export class ConceptService {
  getConceptByUUID(conceptUuid) {
    if (conceptUuid !== null || conceptUuid !== undefined) {
      let conceptList = store.getState().concept;
      let concept = conceptList.find(x => x.uuid === conceptUuid);
      return concept;
    }
  }
}

export class i18n {
  t(concept) {
    return concept;
  }
}
