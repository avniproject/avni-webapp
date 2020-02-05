import { store } from "../../common/utils/reduxStoreUtilty";

export class ConceptService {
  
  getConceptByUUID(conceptUuid) {
    if(conceptUuid != null || conceptUuid != undefined){
   // debugger;
    let conceptList = store.getState().concept;
    let concept = conceptList.find(x => x.uuid === conceptUuid);
    return concept;
    }
  }
}

export class i18n {
  t(concept) {
    // console.log("IN i18n");
    // console.log(store);
    // console.log(store.getState());
    return concept;
  }
}
