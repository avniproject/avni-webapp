import { act } from "react";
import { createRoot } from "react-dom/client";
import BundleSummary from "./BundleSummary";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const ERRORS_REASON =
  "Fix the errors in this build before uploading to the organisation.";

describe("BundleSummary", () => {
  let container;
  let root;

  const render = async (
    summary,
    { isUploadRestrictedOrg = false, isLatestBundle, uploaded = false } = {},
  ) => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () =>
      root.render(
        <BundleSummary
          msg={{ type: "bundle", summary, uploaded }}
          downloadBundleUrl="/bundle.zip"
          onUploadToAvni={jest.fn()}
          isUploadRestrictedOrg={isUploadRestrictedOrg}
          isLatestBundle={isLatestBundle}
        />,
      ),
    );
  };

  const uploadButton = () =>
    [...container.querySelectorAll("button")].find(
      (button) => button.textContent.trim() === "Upload to org",
    );

  const uploadReason = () =>
    uploadButton().closest("[aria-label]")?.getAttribute("aria-label") ?? "";

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("lets a bundle without errors be uploaded to the org", async () => {
    await render({ programs: 1, main_forms: 2, errors: [] });

    expect(uploadButton()).toBeDefined();
    expect(uploadButton().disabled).toBe(false);
    expect(container.textContent).toContain("Your app is ready");
  });

  it("shows Upload to org but does not let it be clicked when the build has errors", async () => {
    await render({
      programs: 1,
      main_forms: 2,
      errors: ["Sheet 'Forms' row 4: unknown data type"],
    });

    expect(uploadButton()).toBeDefined();
    expect(uploadButton().disabled).toBe(true);
    expect(container.textContent).toContain("unknown data type");
    expect(container.textContent).toContain(
      "Your app has errors — fix them before uploading to the organisation",
    );
    expect(container.textContent).not.toContain("Your app is ready");
    expect(uploadReason()).toBe(ERRORS_REASON);
    expect(container.querySelector("a[href='/bundle.zip']")).not.toBeNull();
  });

  it("explains the build errors rather than the org restriction when both block the upload", async () => {
    await render(
      { errors: ["Sheet 'Forms' row 4: unknown data type"] },
      { isUploadRestrictedOrg: true },
    );

    expect(uploadButton().disabled).toBe(true);
    expect(uploadReason()).toBe(ERRORS_REASON);
  });

  it("explains the org restriction when the bundle has no errors", async () => {
    await render({ errors: [] }, { isUploadRestrictedOrg: true });

    expect(uploadButton().disabled).toBe(true);
    expect(uploadReason()).toMatch(
      /^Uploading to a Production or UAT organisation is disabled/,
    );
  });

  it("shows no Upload or Download on a card a later build replaced, since both act on the latest build", async () => {
    await render(
      { programs: 3, errors: ["an earlier error"] },
      { isLatestBundle: false },
    );

    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector("a[href='/bundle.zip']")).toBeNull();
    expect(container.textContent).toContain("A later build replaced this one.");
    expect(container.textContent).toContain("Programs: 3");
    expect(container.textContent).toContain("an earlier error");
  });

  it("says an uploaded card a later build replaced was uploaded", async () => {
    await render({ errors: [] }, { isLatestBundle: false, uploaded: true });

    expect(container.textContent).toContain(
      "Uploaded to the organisation. A later build replaced this one.",
    );
  });
});
