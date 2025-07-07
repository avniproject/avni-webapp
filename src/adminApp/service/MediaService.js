import { httpClient as http } from "../../common/utils/httpClient";

class MediaService {
  static async getMedia(url) {
    try {
      return await http.get(http.withParams(`/media/signedUrl`, { url: url })).then(res => res.data);
    } catch (exception) {
      return "Unable to fetch media";
    }
  }

  static async getMultipleMedia(urls) {
    return (await http.post(`/media/signedUrls`, urls)).data;
  }
}

export default MediaService;
