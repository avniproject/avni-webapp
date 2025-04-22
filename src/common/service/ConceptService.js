import { deburr } from "lodash";
import http from "../utils/httpClient";
import { MediaFolder, uploadImage } from "../utils/S3Client";
import { ConceptMapper } from "../mapper/ConceptMapper";
import WebConcept from "../model/WebConcept";

class ConceptService {
  static searchDashboardFilterConcepts(namePart) {
    const inputValue = deburr(namePart.trim()).toLowerCase();
    return http.get("/web/concept/dashboardFilter/search?namePart=" + encodeURIComponent(inputValue)).then(response => response.data);
  }

  static getAnswerConcepts(conceptUUID) {
    return http.get(`/concept/answerConcepts/search/find?conceptUUID=${conceptUUID}`).then(response => response.data.content);
  }

  static async saveConcept(concept, mediaFile) {
    let s3FileKey, error;
    if (mediaFile) {
      [s3FileKey, error] = await uploadImage(null, mediaFile, MediaFolder.METADATA);
    }
    WebConcept.adjustOrderOfAnswers(concept);
    const response = await http.post("/concepts", concept);
    return ConceptMapper.mapFromResponse(response.data);
  }

  static async getConcept(uuid) {
    let response = await http.get("/web/concept/" + uuid);
    return ConceptMapper.mapFromResponse(response.data);
  }
}

export default ConceptService;
