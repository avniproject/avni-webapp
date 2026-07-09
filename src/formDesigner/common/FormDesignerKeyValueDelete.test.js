import { formDesignerHandleGroupElementKeyValueDelete } from "./FormDesignerHandlers";

describe("formDesignerHandleGroupElementKeyValueDelete", () => {
  it("removes the key from the form element keyValues", () => {
    const draft = {};
    const fe = { keyValues: { guidedCamera: "true", keep: "yes" } };
    formDesignerHandleGroupElementKeyValueDelete(draft, fe, "guidedCamera");
    expect(fe.keyValues).toEqual({ keep: "yes" });
    expect(draft.detectBrowserCloseEvent).toBe(true);
  });
});
