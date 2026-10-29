// DEMO-ONLY abdm-hackathon
// A received record on the Records received tab (HIU_FLOW_110).
import { act } from "react";
import { createRoot } from "react-dom/client";
import FhirBundleView from "./FhirBundleView";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;
beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

const render = (element) => act(async () => root.render(element));
const pdfButtons = () =>
  [...container.querySelectorAll("button")].filter((b) =>
    b.textContent.includes("PDF copy"),
  );

const record = (attachment) => ({
  resourceType: "Bundle",
  entry: [
    { resource: { resourceType: "Composition", title: "Visit" } },
    ...(attachment
      ? [
          {
            resource: {
              resourceType: "DocumentReference",
              content: [{ attachment }],
            },
          },
        ]
      : []),
  ],
});

describe("FhirBundleView", () => {
  it("shows a PDF copy button for a record that has one, and none otherwise", async () => {
    await render(
      <FhirBundleView
        bundle={record({
          contentType: "application/pdf",
          title: "Visit note",
          data: "JVBERi0x",
        })}
      />,
    );
    expect(pdfButtons().length).toBe(1);

    await render(<FhirBundleView bundle={record(null)} />);
    expect(pdfButtons().length).toBe(0);
  });

  it("the raw FHIR JSON does not print the base64", async () => {
    await render(
      <FhirBundleView
        bundle={record({
          contentType: "application/pdf",
          title: "Visit note",
          data: "JVBERi0x",
        })}
      />,
    );

    const raw = container.querySelector("pre").textContent;
    expect(raw).not.toContain("JVBERi0x");
    expect(raw).toContain("<base64, 8 characters>");
  });
});
