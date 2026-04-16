import { httpClient as http } from "../utils/httpClient";

const baseUrl = "/web/customCardConfig";

class CustomCardConfigService {
  static getAll() {
    return http.get(baseUrl).then((res) => res.data);
  }

  static getByUuid(uuid) {
    return http.get(`${baseUrl}/${uuid}`).then((res) => res.data);
  }

  static save(config) {
    const isNew = !config.uuid;
    const url = isNew ? baseUrl : `${baseUrl}/${config.uuid}`;
    const method = isNew ? "post" : "put";
    return http[method](url, config);
  }

  static delete(uuid) {
    return http.delete(`${baseUrl}/${uuid}`);
  }

  static uploadHtml(uuid, file) {
    return http.uploadFile(`${baseUrl}/${uuid}/upload`, file);
  }
}

export default CustomCardConfigService;
