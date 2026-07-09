import { WebConcept } from "./WebConcept";

describe("WebConcept.moveMedia", () => {
  it("moves an item to a new position preserving the rest", () => {
    const media = [{ url: "a" }, { url: "b" }, { url: "c" }];
    expect(WebConcept.moveMedia(media, 0, 2)).toEqual([
      { url: "b" },
      { url: "c" },
      { url: "a" },
    ]);
  });

  it("returns input unchanged for out-of-range index", () => {
    const media = [{ url: "a" }];
    expect(WebConcept.moveMedia(media, 0, 5)).toEqual([{ url: "a" }]);
  });
});

describe("WebConcept.removeMediaAt", () => {
  it("removes the item at index", () => {
    const media = [{ url: "a" }, { url: "b" }];
    expect(WebConcept.removeMediaAt(media, 0)).toEqual([{ url: "b" }]);
  });
});

describe("WebConcept.prepareMediaForSave", () => {
  it("uploads unsaved items in order and preserves array order", async () => {
    const media = [
      { type: "Image", file: { name: "f1" } },
      { type: "Image", url: "existing-key" },
      { type: "Video", file: { name: "f2" } },
    ];
    const calls: string[] = [];
    const upload = async (file: any, type: string): Promise<[string, any]> => {
      calls.push(`${type}:${file.name}`);
      return [`key-${file.name}`, undefined];
    };
    const result = await WebConcept.prepareMediaForSave(media as any, upload);
    expect(calls).toEqual(["Image:f1", "Video:f2"]);
    expect(result.media).toEqual([
      { url: "key-f1", type: "Image" },
      { url: "existing-key", type: "Image" },
      { url: "key-f2", type: "Video" },
    ]);
  });

  it("returns error and stops on first upload failure", async () => {
    const media = [{ type: "Image", file: { name: "bad" } }];
    const upload = async (): Promise<[string, any]> => ["", "boom"];
    const result = await WebConcept.prepareMediaForSave(media as any, upload);
    expect(result.error).toBe("boom");
    expect(result.media).toBeUndefined();
  });
});
