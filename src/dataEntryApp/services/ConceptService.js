import { store } from "../../common/store/createStore";

export class ConceptService {
  
  getConceptByUUID(conceptUuid) {
    if (conceptUuid !== null || conceptUuid !== undefined) {
      let conceptList = store.getState().dataEntry.conceptReducer.concepts;
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
