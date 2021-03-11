import http from "./httpClient";
import { get } from "lodash";

export const uploadImage = async (existingURL, file, bucketName) => {
  if (file == null) {
    return [existingURL];
  }
  return http
    .uploadFile(http.withParams("/media/saveImage", { bucketName }), file)
    .then(r => [r.data, null])
    .catch(r => [null, `${get(r, "response.data") || get(r, "message") || "unknown error"}`]);
};

export const bucketName = Object.freeze({
  ICONS: "icons",
  NEWS: "news"
});
