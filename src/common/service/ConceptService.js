import { deburr } from "lodash";
import http from "../utils/httpClient";

class ConceptService {
  static searchDashboardFilterConcepts(namePart) {
    const inputValue = deburr(namePart.trim()).toLowerCase();
    return http
      .get("/web/concept/dashboardFilter/search?namePart=" + encodeURIComponent(inputValue))
      .then(response => response.data);
  }

  static async getAnswerConcepts(conceptUUID) {
    return http
      .get(`/concept/answerConcepts/search/find?conceptUUID=${conceptUUID}`)
      .then(response => response.data.content);
  }
}

export default ConceptService;
