import http from "./httpClient";
import { get } from "lodash";

export const uploadImage = async (existingURL, file, folderName) => {
  if (file == null) {
    return [existingURL];
  }
  return http
    .uploadFile(http.withParams("/media/saveImage", { folderName }), file)
    .then(r => [r.data, null])
    .catch(r => [null, `${get(r, "response.data") || get(r, "message") || "unknown error"}`]);
};

export const MediaFolder = Object.freeze({
  PROFILE_PICS: "profile-pics",
  ICONS: "icons",
  NEWS: "news",
  METADATA: "metadata"
});
