import { deburr } from "lodash";
import { httpClient as http } from "../utils/httpClient";
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

  static async saveConcept(concept) {
    let s3FileKey, error;
    if (concept.unSavedMediaFile) {
      [s3FileKey, error] = await uploadImage(null, concept.unSavedMediaFile, MediaFolder.METADATA);
      if (error) {
        return { error };
      }
    }
    if (concept.unSavedMediaFile) {
      concept.mediaUrl = s3FileKey;
    }

    if (concept.dataType === "Coded") {
      WebConcept.adjustOrderOfAnswers(concept);
      for (const answer of concept.answers) {
        if (answer.unSavedMediaFile) {
          [s3FileKey, error] = await uploadImage(null, answer.unSavedMediaFile, MediaFolder.METADATA);
          if (error) {
            return { error };
          }
        }
        if (answer.unSavedMediaFile) {
          answer.mediaUrl = s3FileKey;
        }
      }
    }

    const response = await http.post("/concepts", concept);
    return { concept: ConceptMapper.mapFromResponse(response.data) };
  }

  static async getConcept(uuid) {
    let response = await http.get("/web/concept/" + uuid);
    return ConceptMapper.mapFromResponse(response.data);
  }
}

export default ConceptService;
