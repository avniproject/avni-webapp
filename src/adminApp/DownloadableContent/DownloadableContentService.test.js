/* global File */
import { jest } from "@jest/globals";

jest.mock("../../common/utils/httpClient", () => {
  const mockClient = {
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    get: jest.fn(() => Promise.resolve({ data: [] })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  };
  return { httpClient: mockClient, default: mockClient };
});

import { httpClient } from "../../common/utils/httpClient";

const post = httpClient.post;
const put = httpClient.put;
const get = httpClient.get;
const del = httpClient.delete;

const SHA = "a".repeat(64);

let DownloadableContentService;
let buildContentKey;
let buildBlobFileName;
let isValidSha256;
let parsePayload;
let validateContent;
let buildContentRequest;
let performSave;
let SaveStepError;
let Category;

beforeAll(async () => {
  const mod = await import("./DownloadableContentService");
  DownloadableContentService = mod.default;
  ({
    buildContentKey,
    buildBlobFileName,
    isValidSha256,
    parsePayload,
    validateContent,
    buildContentRequest,
    performSave,
    SaveStepError,
    Category,
  } = mod);
});

beforeEach(() => {
  post.mockClear();
  put.mockClear();
  get.mockClear();
  del.mockClear();
});

describe("contentKey / blob filename", () => {
  it("builds contentKey as models/<sha256>.bin", () => {
    expect(buildContentKey(SHA)).toBe(`models/${SHA}.bin`);
  });

  it("builds blob filename as <sha256>.bin", () => {
    expect(buildBlobFileName(SHA)).toBe(`${SHA}.bin`);
  });
});

describe("sha256 validation", () => {
  it("accepts 64 lowercase hex chars", () => {
    expect(isValidSha256(SHA)).toBe(true);
  });

  it("rejects wrong length, uppercase, and non-hex", () => {
    expect(isValidSha256("a".repeat(63))).toBe(false);
    expect(isValidSha256("A".repeat(64))).toBe(false);
    expect(isValidSha256("z".repeat(64))).toBe(false);
    expect(isValidSha256("")).toBe(false);
    expect(isValidSha256(undefined)).toBe(false);
  });

  it("tolerates surrounding whitespace", () => {
    expect(isValidSha256(`  ${SHA}  `)).toBe(true);
  });
});

describe("payload JSON validation", () => {
  it("treats blank as an empty object", () => {
    expect(parsePayload("")).toEqual([{}, null]);
    expect(parsePayload("   ")).toEqual([{}, null]);
  });

  it("parses a JSON object", () => {
    const [payload, error] = parsePayload('{"engine":"onnx"}');
    expect(error).toBeNull();
    expect(payload).toEqual({ engine: "onnx" });
  });

  it("rejects invalid JSON", () => {
    const [payload, error] = parsePayload("{not json}");
    expect(payload).toBeNull();
    expect(error).toBeTruthy();
  });

  it("rejects a non-object JSON value", () => {
    expect(parsePayload("[1,2]")[0]).toBeNull();
    expect(parsePayload("42")[0]).toBeNull();
  });
});

describe("validateContent", () => {
  it("passes for a valid record", () => {
    expect(validateContent({ name: "model", sha256: SHA, payloadText: "{}" })).toEqual([]);
  });

  it("flags empty name, bad sha, and bad payload", () => {
    const errors = validateContent({
      name: "",
      sha256: "bad",
      payloadText: "{bad}",
    });
    const keys = errors.map((e) => e.key);
    expect(keys).toContain("EMPTY_NAME");
    expect(keys).toContain("INVALID_SHA256");
    expect(keys).toContain("INVALID_PAYLOAD");
  });
});

describe("validateContent edgeModel payload shape", () => {
  const validShape = JSON.stringify({ engine: "onnx", input: {}, output: {} });

  it("passes for a well-shaped edgeModel payload", () => {
    expect(validateContent({ name: "model", category: Category.edgeModel, sha256: SHA, payloadText: validShape })).toEqual([]);
  });

  it("flags a valid-JSON-object payload missing engine/input/output for edgeModel", () => {
    const keys = validateContent({
      name: "model",
      category: Category.edgeModel,
      sha256: SHA,
      payloadText: "{}",
    }).map((e) => e.key);
    expect(keys).toContain("INVALID_PAYLOAD_SHAPE");
  });

  it("flags an empty engine string", () => {
    const keys = validateContent({
      name: "model",
      category: Category.edgeModel,
      sha256: SHA,
      payloadText: JSON.stringify({ engine: "  ", input: {}, output: {} }),
    }).map((e) => e.key);
    expect(keys).toContain("INVALID_PAYLOAD_SHAPE");
  });

  it("flags non-object input/output", () => {
    const keys = validateContent({
      name: "model",
      category: Category.edgeModel,
      sha256: SHA,
      payloadText: JSON.stringify({ engine: "onnx", input: "x", output: [] }),
    }).map((e) => e.key);
    expect(keys).toContain("INVALID_PAYLOAD_SHAPE");
  });

  it("does not run shape validation when the payload is not valid JSON", () => {
    const keys = validateContent({
      name: "model",
      category: Category.edgeModel,
      sha256: SHA,
      payloadText: "{bad}",
    }).map((e) => e.key);
    expect(keys).toContain("INVALID_PAYLOAD");
    expect(keys).not.toContain("INVALID_PAYLOAD_SHAPE");
  });

  it("does not require the shape when category is not edgeModel", () => {
    expect(validateContent({ name: "model", category: "other", sha256: SHA, payloadText: "{}" })).toEqual([]);
  });
});

describe("buildContentRequest", () => {
  it("derives contentKey and never includes a key field", () => {
    const request = buildContentRequest({
      uuid: "u-1",
      name: "  model  ",
      category: Category.edgeModel,
      sha256: `  ${SHA}  `,
      needsKey: true,
      payload: { engine: "onnx" },
    });
    expect(request).toEqual({
      uuid: "u-1",
      name: "model",
      category: "edgeModel",
      sha256: SHA,
      contentKey: `models/${SHA}.bin`,
      needsKey: true,
      payload: { engine: "onnx" },
    });
    expect(request).not.toHaveProperty("key");
    expect(request).not.toHaveProperty("aesKey");
  });

  it("omits uuid for a create request", () => {
    const request = buildContentRequest({
      name: "model",
      category: Category.edgeModel,
      sha256: SHA,
      needsKey: false,
      payload: {},
    });
    expect(request).not.toHaveProperty("uuid");
  });
});

describe("save routes to POST/PUT and excludes the key", () => {
  it("POSTs a create request to /web/downloadableContent without a key", async () => {
    const request = buildContentRequest({
      name: "model",
      category: Category.edgeModel,
      sha256: SHA,
      needsKey: true,
      payload: {},
    });
    await DownloadableContentService.save(request);
    expect(post).toHaveBeenCalledWith("/web/downloadableContent", request);
    expect(put).not.toHaveBeenCalled();
    expect(JSON.stringify(post.mock.calls[0][1])).not.toMatch(/secret|aes/i);
  });

  it("PUTs an edit request to /web/downloadableContent/<uuid>", async () => {
    const request = buildContentRequest({
      uuid: "u-9",
      name: "model",
      category: Category.edgeModel,
      sha256: SHA,
      needsKey: true,
      payload: {},
    });
    await DownloadableContentService.save(request);
    expect(put).toHaveBeenCalledWith("/web/downloadableContent/u-9", request);
    expect(post).not.toHaveBeenCalled();
  });
});

describe("uploadBlob", () => {
  it("posts to /web/uploadMedia with parentFolder=models and filename <sha256>.bin", async () => {
    const file = new File(["ciphertext"], "model.bin", {
      type: "application/octet-stream",
    });
    await DownloadableContentService.uploadBlob(file, SHA);
    const [url, formData] = post.mock.calls[0];
    expect(url).toBe("/web/uploadMedia");
    expect(formData.get("parentFolder")).toBe("models");
    const uploaded = formData.get("file");
    expect(uploaded.name).toBe(`${SHA}.bin`);
  });

  it("forwards an onUploadProgress callback as axios config", async () => {
    const file = new File(["ciphertext"], "model.bin", {
      type: "application/octet-stream",
    });
    const onUploadProgress = jest.fn();
    await DownloadableContentService.uploadBlob(file, SHA, onUploadProgress);
    const config = post.mock.calls[0][2];
    expect(config).toEqual({ onUploadProgress });
  });

  it("omits the config arg when no progress callback is given", async () => {
    const file = new File(["ciphertext"], "model.bin", {
      type: "application/octet-stream",
    });
    await DownloadableContentService.uploadBlob(file, SHA);
    expect(post.mock.calls[0][2]).toBeUndefined();
  });
});

describe("saveModelKey", () => {
  it("posts the key only to /web/modelKey", async () => {
    await DownloadableContentService.saveModelKey(SHA, "super-secret");
    expect(post).toHaveBeenCalledWith("/web/modelKey", {
      sha256: SHA,
      key: "super-secret",
    });
    const downloadableContentCalls = post.mock.calls.filter(([url]) => url === "/web/downloadableContent");
    expect(downloadableContentCalls).toHaveLength(0);
  });
});

describe("validateContent needsKey / blob rules", () => {
  const valid = { name: "model", sha256: SHA, payloadText: "{}", needsKey: true };

  it("requires a key on create when needsKey is true and none entered", () => {
    const keys = validateContent(valid, {
      editing: false,
      hasFile: true,
      hasKey: false,
    }).map((e) => e.key);
    expect(keys).toContain("MISSING_KEY");
  });

  it("does not require a key on create when needsKey is false", () => {
    const errors = validateContent({ ...valid, needsKey: false }, { editing: false, hasFile: true, hasKey: false });
    expect(errors).toEqual([]);
  });

  it("passes on create when needsKey and a key is entered", () => {
    expect(validateContent(valid, { editing: false, hasFile: true, hasKey: true })).toEqual([]);
  });

  it("requires a new blob file when sha256 changes on edit", () => {
    const keys = validateContent(
      { ...valid, sha256: SHA },
      { editing: true, originalSha256: "b".repeat(64), hasFile: false, hasKey: true },
    ).map((e) => e.key);
    expect(keys).toContain("MISSING_BLOB");
  });

  it("requires the key too when sha256 changes on edit and needsKey", () => {
    const keys = validateContent(
      { ...valid, sha256: SHA },
      { editing: true, originalSha256: "b".repeat(64), hasFile: true, hasKey: false },
    ).map((e) => e.key);
    expect(keys).toContain("MISSING_KEY");
  });

  it("leaves file and key optional when sha256 is unchanged on edit", () => {
    expect(
      validateContent(valid, {
        editing: true,
        originalSha256: SHA,
        hasFile: false,
        hasKey: false,
      }),
    ).toEqual([]);
  });
});

describe("performSave orchestration", () => {
  const SHA_B = "b".repeat(64);

  const makeFile = () => new File(["ciphertext"], "model.bin", { type: "application/octet-stream" });

  const trackingService = (calls) => ({
    uploadBlob: jest.fn(() => {
      calls.push("uploadBlob");
      return Promise.resolve({ data: {} });
    }),
    saveModelKey: jest.fn(() => {
      calls.push("saveModelKey");
      return Promise.resolve({ data: {} });
    }),
    save: jest.fn(() => {
      calls.push("save");
      return Promise.resolve({ data: { uuid: "u-1" } });
    }),
  });

  const makeRequest = () =>
    buildContentRequest({
      name: "model",
      category: Category.edgeModel,
      sha256: SHA_B,
      needsKey: true,
      payload: {},
    });

  it("writes blob and key BEFORE the record create/PUT", async () => {
    const request = makeRequest();
    const calls = [];
    const service = trackingService(calls);
    await performSave({
      request,
      sha256: SHA_B,
      file: makeFile(),
      key: "secret",
      needsKey: true,
      service,
    });
    expect(calls).toEqual(["uploadBlob", "saveModelKey", "save"]);
  });

  it("does NOT create the record when the blob upload fails", async () => {
    const request = makeRequest();
    const calls = [];
    const service = trackingService(calls);
    service.uploadBlob.mockRejectedValueOnce(new Error("boom"));
    await expect(performSave({ request, sha256: SHA_B, file: makeFile(), key: "secret", service })).rejects.toBeInstanceOf(SaveStepError);
    expect(service.save).not.toHaveBeenCalled();
    expect(service.saveModelKey).not.toHaveBeenCalled();
  });

  it("does NOT create the record when the key save fails", async () => {
    const request = makeRequest();
    const calls = [];
    const service = trackingService(calls);
    service.saveModelKey.mockRejectedValueOnce(new Error("boom"));
    await expect(performSave({ request, sha256: SHA_B, file: makeFile(), key: "secret", needsKey: true, service })).rejects.toBeInstanceOf(
      SaveStepError,
    );
    expect(service.save).not.toHaveBeenCalled();
  });

  it("skips the key write when no key is entered (e.g. non-needsKey edit)", async () => {
    const request = makeRequest();
    const calls = [];
    const service = trackingService(calls);
    await performSave({ request, sha256: SHA_B, file: null, key: "", service });
    expect(service.saveModelKey).not.toHaveBeenCalled();
    expect(service.uploadBlob).not.toHaveBeenCalled();
    expect(calls).toEqual(["save"]);
  });

  it("does NOT write the key when needsKey is false, even if a key value is present", async () => {
    const request = makeRequest();
    const calls = [];
    const service = trackingService(calls);
    await performSave({ request, sha256: SHA_B, file: null, key: "leftover-key", needsKey: false, service });
    expect(service.saveModelKey).not.toHaveBeenCalled();
    expect(calls).toEqual(["save"]);
  });

  it("names the failing step in the thrown error", async () => {
    const request = makeRequest();
    const service = trackingService([]);
    service.save.mockRejectedValueOnce(new Error("boom"));
    await expect(performSave({ request, sha256: SHA_B, file: null, key: "", service })).rejects.toMatchObject({
      step: "save the content record",
    });
  });
});
