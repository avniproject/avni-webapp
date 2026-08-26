import { httpClient as http } from "../../common/utils/httpClient";

const ENDPOINT = "/web/downloadableContent";
const SHA256_PATTERN = /^[0-9a-f]{64}$/;

export const Category = Object.freeze({
  edgeModel: "edgeModel",
  guidanceImage: "guidanceImage",
});

// The blob IS the picture: an <Image> can decode it, and the device can hash-check it.
export const isUnencryptedCategory = (category) => category === Category.guidanceImage;

export const GuidanceKind = Object.freeze({
  reckoner: "reckoner",
  overlay: "overlay",
});

export const GUIDANCE_KIND_LABELS = Object.freeze({
  [GuidanceKind.reckoner]: "Reference photo",
  [GuidanceKind.overlay]: "Framing outline",
});

// Mirrors the server's ManagedContentNamespace. The prefix decides the storage class, and each
// routes independently, so sharing one would send guidance wherever the org keeps its models.
const NAMESPACE = Object.freeze({
  [Category.edgeModel]: "models",
  [Category.guidanceImage]: "guidance",
});

const DEFAULT_BLOB_EXTENSION = "bin";
export const IMAGE_EXTENSIONS = Object.freeze(["png", "jpg", "jpeg"]);

export const namespaceFor = (category) => NAMESPACE[category] || NAMESPACE[Category.edgeModel];

export const extensionOf = (fileName) => {
  const match = /\.([A-Za-z0-9]+)$/.exec(fileName || "");
  return match ? match[1].toLowerCase() : "";
};

// `.bin` is honest for opaque ciphertext; a rendered picture keeps a real image extension.
export const blobExtensionFor = (category, fileName) => (isUnencryptedCategory(category) ? extensionOf(fileName) : DEFAULT_BLOB_EXTENSION);

export const buildContentKey = (category, sha256, extension = DEFAULT_BLOB_EXTENSION) => `${namespaceFor(category)}/${sha256}.${extension}`;

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

// A rule addresses a picture by position and kind; without both it is unreachable.
export const validateGuidancePayloadShape = (payload) => {
  const problems = [];
  if (!Number.isInteger(payload.sequence) || payload.sequence < 1) {
    problems.push("position (a whole number, 1 or more)");
  }
  if (typeof payload.site !== "string" || payload.site.trim() === "") {
    problems.push("site name (a non-empty string)");
  }
  if (!Object.values(GuidanceKind).includes(payload.kind)) {
    problems.push(`picture type (one of ${Object.values(GuidanceKind).join(", ")})`);
  }
  if (problems.length === 0) return null;
  return `Guidance details are missing or invalid: ${problems.join(", ")}.`;
};

// Two records sharing them makes the lookup ambiguous and one of the pair unreachable.
export const findDuplicateGuidance = (existingContents, { uuid, category, payload }) => {
  if (category !== Category.guidanceImage || payload == null) return null;
  return (
    (existingContents || []).find(
      (existing) =>
        existing.uuid !== uuid &&
        !existing.voided &&
        existing.category === Category.guidanceImage &&
        (existing.payload || {}).sequence === payload.sequence &&
        (existing.payload || {}).kind === payload.kind,
    ) || null
  );
};

// Computed from the file, so an authored-wrong checksum cannot happen. Unencrypted content only.
export const computeFileSha256 = async (file, subtle = globalThis.crypto && globalThis.crypto.subtle) => {
  if (!subtle) throw new Error("This browser cannot compute a SHA-256 (crypto.subtle unavailable)");
  const digest = await subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const validateContent = (
  { uuid = null, name, category, sha256, payloadText, needsKey, blobExtension },
  { editing = false, hasFile = false, hasKey = false, originalSha256 = null, existingContents = null } = {},
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
  } else if (category === Category.guidanceImage) {
    const shapeError = validateGuidancePayloadShape(payload);
    if (shapeError) {
      errors.push({ key: "INVALID_PAYLOAD_SHAPE", message: shapeError });
    } else if (existingContents) {
      const duplicate = findDuplicateGuidance(existingContents, { uuid, category, payload });
      if (duplicate) {
        errors.push({
          key: "DUPLICATE_GUIDANCE",
          message: `A ${GUIDANCE_KIND_LABELS[payload.kind]} for position ${payload.sequence} already exists ("${duplicate.name}"). Edit that record instead.`,
        });
      }
    }
  }

  // Caught here rather than on upload, where the server would reject it anyway.
  if (category === Category.guidanceImage && !IMAGE_EXTENSIONS.includes(blobExtension)) {
    errors.push({
      key: "INVALID_IMAGE_TYPE",
      message: `Choose a ${IMAGE_EXTENSIONS.join(", ")} image.`,
    });
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
      message: isUnencryptedCategory(category)
        ? "Choose the image file again when the content changes"
        : "A new encrypted blob file is required when the SHA-256 changes",
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

export const buildContentRequest = ({ uuid, name, category, sha256, needsKey, payload, blobExtension }) => {
  const trimmedSha = sha256.trim();
  const request = {
    name: name.trim(),
    category,
    sha256: trimmedSha,
    contentKey: buildContentKey(category, trimmedSha, blobExtension || DEFAULT_BLOB_EXTENSION),
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
      // contentKey is the single source of truth, so the upload cannot drift from the record.
      await service.uploadBlob(file, request.contentKey, onUploadProgress);
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

  uploadBlob: (file, contentKey, onUploadProgress) =>
    http.post("/web/uploadMedia", uploadFormData(file, contentKey), onUploadProgress ? { onUploadProgress } : undefined),

  saveModelKey: (sha256, key) => http.post("/web/modelKey", { sha256: sha256.trim(), key }),
};

const uploadFormData = (file, contentKey) => {
  const separator = contentKey.indexOf("/");
  const formData = new FormData();
  formData.append("file", file, contentKey.slice(separator + 1));
  formData.append("parentFolder", contentKey.slice(0, separator));
  return formData;
};

export default DownloadableContentService;
