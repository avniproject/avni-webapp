import { httpClient as http } from "../../common/utils/httpClient";

const ENDPOINT = "/web/downloadableContent";
const MODELS_FOLDER = "models";
const SHA256_PATTERN = /^[0-9a-f]{64}$/;

export const Category = Object.freeze({
  edgeModel: "edgeModel",
});

export const buildContentKey = (sha256) => `${MODELS_FOLDER}/${sha256}.bin`;

export const buildBlobFileName = (sha256) => `${sha256}.bin`;

export const isValidSha256 = (sha256) => typeof sha256 === "string" && SHA256_PATTERN.test(sha256.trim());

export const parsePayload = (payloadText) => {
  if (payloadText == null || payloadText.trim() === "") {
    return [{}, null];
  }
  try {
    const parsed = JSON.parse(payloadText);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return [null, "Payload must be a JSON object."];
    }
    return [parsed, null];
  } catch {
    return [null, "Payload is not valid JSON."];
  }
};

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

// The on-device consumer expects a model payload shaped as
// { engine: <non-empty string>, input: {...}, output: {...} }. Validating here
// stops a malformed payload from saving cleanly and only failing on the device.
export const validatePayloadShape = (payload) => {
  const missing = [];
  if (typeof payload.engine !== "string" || payload.engine.trim() === "") {
    missing.push("engine (a non-empty string)");
  }
  if (!isObject(payload.input)) missing.push("input (an object)");
  if (!isObject(payload.output)) missing.push("output (an object)");
  if (missing.length === 0) return null;
  return `Payload is missing: ${missing.join(", ")}.`;
};

export const validateContent = (
  { name, category, sha256, payloadText, needsKey },
  { editing = false, hasFile = false, hasKey = false, originalSha256 = null } = {},
) => {
  const errors = [];
  if (name == null || name.trim() === "") {
    errors.push({ key: "EMPTY_NAME", message: "Name cannot be empty" });
  }
  if (!isValidSha256(sha256)) {
    errors.push({
      key: "INVALID_SHA256",
      message: "SHA-256 must be 64 lowercase hex characters",
    });
  }
  const [payload, payloadError] = parsePayload(payloadText);
  if (payloadError) {
    errors.push({ key: "INVALID_PAYLOAD", message: payloadError });
  } else if (category === Category.edgeModel) {
    const shapeError = validatePayloadShape(payload);
    if (shapeError) {
      errors.push({ key: "INVALID_PAYLOAD_SHAPE", message: shapeError });
    }
  }

  const trimmedSha = typeof sha256 === "string" ? sha256.trim() : sha256;
  const shaChanged = editing && trimmedSha !== originalSha256;

  // The blob and any AES key are addressed by sha256. On a new record, or when
  // the sha changes on edit, the existing blob/key cannot be reused: a freshly
  // selected blob is required, and the key is required when the content needs one.
  // When the sha is unchanged on edit, both stay optional (keep existing).
  const dependenciesMustBeSupplied = !editing || shaChanged;
  if (shaChanged && !hasFile) {
    errors.push({
      key: "MISSING_BLOB",
      message: "A new encrypted blob file is required when the SHA-256 changes",
    });
  }
  if (needsKey && dependenciesMustBeSupplied && !hasKey) {
    errors.push({
      key: "MISSING_KEY",
      message: "An AES key is required for content that needs a key",
    });
  }

  return errors;
};

export const buildContentRequest = ({ uuid, name, category, sha256, needsKey, payload }) => {
  const trimmedSha = sha256.trim();
  const request = {
    name: name.trim(),
    category,
    sha256: trimmedSha,
    contentKey: buildContentKey(trimmedSha),
    needsKey: !!needsKey,
    payload: payload || {},
  };
  if (uuid) request.uuid = uuid;
  return request;
};

export class SaveStepError extends Error {
  constructor(step, cause) {
    super(`Failed to ${step}`);
    this.name = "SaveStepError";
    this.step = step;
    this.cause = cause;
  }
}

// Writes the record's dependencies (blob, then key) before the record itself,
// so a record can never sync to devices ahead of the blob/key it points to.
// If a dependency write fails, the record is not created/updated; the blob is
// content-addressed by sha, so retrying a partially completed save is safe.
export const performSave = async ({ request, sha256, file, key, needsKey, service, onUploadProgress }) => {
  if (file) {
    try {
      await service.uploadBlob(file, sha256, onUploadProgress);
    } catch (error) {
      throw new SaveStepError("upload the encrypted blob", error);
    }
  }
  if (needsKey && key != null && key.trim() !== "") {
    try {
      await service.saveModelKey(sha256, key);
    } catch (error) {
      throw new SaveStepError("save the AES key", error);
    }
  }
  try {
    return await service.save(request);
  } catch (error) {
    throw new SaveStepError("save the content record", error);
  }
};

const DownloadableContentService = {
  getAll: () => http.get(ENDPOINT).then((response) => response.data),

  getByUuid: (uuid) => http.get(`${ENDPOINT}/${uuid}`).then((response) => response.data),

  save: (request) => (request.uuid ? http.put(`${ENDPOINT}/${request.uuid}`, request) : http.post(ENDPOINT, request)),

  delete: (uuid) => http.delete(`${ENDPOINT}/${uuid}`),

  uploadBlob: (file, sha256, onUploadProgress) =>
    http.post("/web/uploadMedia", uploadFormData(file, sha256), onUploadProgress ? { onUploadProgress } : undefined),

  saveModelKey: (sha256, key) => http.post("/web/modelKey", { sha256: sha256.trim(), key }),
};

const uploadFormData = (file, sha256) => {
  const formData = new FormData();
  formData.append("file", file, buildBlobFileName(sha256));
  formData.append("parentFolder", MODELS_FOLDER);
  return formData;
};

export default DownloadableContentService;
