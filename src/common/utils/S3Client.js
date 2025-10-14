import { httpClient as http } from "./httpClient";
import { get } from "lodash";

const uploadMedia = async (existingURL, file, folderName, type) => {
  if (file == null) {
    return [existingURL];
  }
  return http
    .uploadFile(http.withParams(`/media/save${type}`, { folderName }), file)
    .then((r) => [r.data, null])
    .catch((r) => [null, `${get(r, "response.data") || get(r, "message") || "unknown error"}`]);
};

export const uploadImage = async (existingURL, file, folderName) => uploadMedia(existingURL, file, folderName, "Image");
export const uploadVideo = async (existingURL, file, folderName) => uploadMedia(existingURL, file, folderName, "Video");

export const MediaFolder = Object.freeze({
  PROFILE_PICS: "profile-pics",
  ICONS: "icons",
  NEWS: "news",
  METADATA: "metadata",
});
