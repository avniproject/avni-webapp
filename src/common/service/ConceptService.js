import { deburr, isNil } from "lodash";
import { httpClient as http } from "../utils/httpClient";
import { MediaFolder, uploadImage, uploadVideo } from "../utils/S3Client";
import { ConceptMapper } from "../mapper/ConceptMapper";
import WebConcept from "../model/WebConcept";

class ConceptService {
  static searchDashboardFilterConcepts(namePart) {
    const inputValue = deburr(namePart.trim()).toLowerCase();
    return http.get("/web/concept/dashboardFilter/search?namePart=" + encodeURIComponent(inputValue)).then((response) => response.data);
  }

  static getAnswerConcepts(conceptUUID) {
    return http.get(`/concept/answerConcepts/search/find?conceptUUID=${conceptUUID}`).then((response) => response.data.content);
  }

  static async saveConcept(concept) {
    let s3FileKey, error;
    if (concept.unsavedImage) {
      [s3FileKey, error] = await uploadImage(null, concept.unsavedImage, MediaFolder.METADATA);
      if (error) {
        return { error };
      }
      if (isNil(concept.media)) concept.media = [];
      concept.media.push({ url: s3FileKey, type: "Image" });
    }
    if (concept.unsavedVideo) {
      [s3FileKey, error] = await uploadVideo(null, concept.unsavedVideo, MediaFolder.METADATA);
      if (error) {
        return { error };
      }
      if (isNil(concept.media)) concept.media = [];
      concept.media.push({ url: s3FileKey, type: "Video" });
    }

    if (concept.dataType === "Coded") {
      WebConcept.adjustOrderOfAnswers(concept);
      for (const answer of concept.answers) {
        if (answer.unsavedImage) {
          [s3FileKey, error] = await uploadImage(null, answer.unsavedImage, MediaFolder.METADATA);
          if (error) {
            return { error };
          }
          if (isNil(answer.media)) answer.media = [];
          answer.media.push({ url: s3FileKey, type: "Image" });
        }
        if (answer.unsavedVideo) {
          [s3FileKey, error] = await uploadVideo(null, answer.unsavedVideo, MediaFolder.METADATA);
          if (error) {
            return { error };
          }
          if (isNil(answer.media)) answer.media = [];
          answer.media.push({ url: s3FileKey, type: "Video" });
        }
      }
    }

    try {
      const response = await http.post("/concepts", concept);
      return { concept: ConceptMapper.mapFromResponse(response.data) };
    } catch (err) {
      // Handle conflict (409) errors more gracefully
      if (err.response && (err.response.status === 409 || err.response.status === 400)) {
        return {
          error: "A concept with this name already exists. Please use a different name.",
        };
      }
      // Handle other errors
      return {
        error: err.message || "Failed to save concept. Please try again.",
      };
    }
  }

  static async getConcept(uuid) {
    let response = await http.get("/web/concept/" + uuid);
    return ConceptMapper.mapFromResponse(response.data);
  }
}

export default ConceptService;
