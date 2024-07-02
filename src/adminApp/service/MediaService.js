import http from "../../common/utils/httpClient";

class MediaService {
  static async getMedia(url) {
    try {
      return await http.get(http.withParams(`/media/signedUrl`, { url: url })).then(res => res.data);
    } catch (exception) {
      return "Unable to fetch media";
    }
  }
}

export default MediaService;
