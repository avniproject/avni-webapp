import {store} from '../../common/utils/reduxStoreUtilty';

export class ConceptService {
  getConceptByUUID(concept) {
    return concept;
  }
}

export class i18n {
  t(concept) {
    console.log("IN i18n");
    console.log(store);
    console.log(store.getState());
    return concept;
  }
}
