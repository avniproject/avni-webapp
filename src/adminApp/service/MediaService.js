import http from "../../common/utils/httpClient";

class MediaService {
  static getMedia(url) {
    return http.get(http.withParams(`/media/signedUrl`, { url: url })).then(res => res.data);
  }
}

export default MediaService;
