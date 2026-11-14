import { act } from "react";
import { createRoot } from "react-dom/client";
import ChatPanel from "./ChatPanel";

jest.mock("react-markdown", () => ({ children }) => <div>{children}</div>);

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const bundle = (errors, uploaded = false) => ({
  type: "bundle",
  summary: { programs: 1, main_forms: 2, errors },
  uploaded,
});

describe("ChatPanel bundle cards", () => {
  let container;
  let root;

  const render = async (messages) => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () =>
      root.render(
        <ChatPanel
          messages={messages}
          toolCalls={[]}
          status="idle"
          onSend={jest.fn()}
          onResolveChanges={jest.fn()}
          onUploadToAvni={jest.fn()}
          downloadBundleUrl="/bundle.zip"
          uploadErrorLogUrl="/errors.csv"
          disabled={false}
          isUploadRestrictedOrg={false}
          awaitingReply={false}
        />,
      ),
    );
  };

  const uploadButtons = () =>
    [...container.querySelectorAll("button")].filter((button) =>
      ["Upload to org", "Uploaded"].includes(button.textContent.trim()),
    );

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("offers Upload to org only on the latest card, which is the build every upload sends", async () => {
    await render([bundle([]), bundle([])]);

    expect(uploadButtons()).toHaveLength(1);
    expect(uploadButtons()[0].disabled).toBe(false);
    expect(container.querySelectorAll("a[href='/bundle.zip']")).toHaveLength(1);
    expect(container.textContent).toContain("A later build replaced this one.");
  });

  it("blocks the only Upload to org when the latest build has errors, even after a clean earlier build", async () => {
    await render([
      bundle([]),
      bundle(["Sheet 'Forms' row 4: unknown data type"]),
    ]);

    expect(uploadButtons()).toHaveLength(1);
    expect(uploadButtons()[0].disabled).toBe(true);
  });

  it("leaves nothing to upload again once the latest build is uploaded", async () => {
    await render([bundle([]), bundle([], true)]);

    expect(
      uploadButtons().map((button) => [
        button.textContent.trim(),
        button.disabled,
      ]),
    ).toEqual([["Uploaded", true]]);
  });
});
