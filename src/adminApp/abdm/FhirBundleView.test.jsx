import { act } from "react";
import { createRoot } from "react-dom/client";
import FhirBundleView from "./FhirBundleView";
import discharge from "./__fixtures__/samples/DischargeSummary.json";
import healthImage from "./__fixtures__/samples/HealthDocumentRecord.json";
import healthDoc from "./__fixtures__/samples/HealthDocumentRecord-document.json";
import invoice from "./__fixtures__/samples/Invoice.json";

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

  it("offers no button for an attachment that is not a PDF", async () => {
    await render(
      <FhirBundleView
        bundle={record({
          contentType: "text/html",
          title: "Page",
          data: "PGh0bWw+",
        })}
      />,
    );
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

  it("shows the record type, each section under its heading, and an entry's parts", async () => {
    await render(<FhirBundleView bundle={discharge} />);
    const text = container.textContent;
    expect(text).toContain("Discharge summary");
    ["Chief complaints", "Procedures", "Care Plan"].forEach((h) =>
      expect(
        [...container.querySelectorAll("h6, .MuiTypography-subtitle2")].map(
          (e) => e.textContent,
        ),
      ).toContain(h),
    );
    expect(text).toContain("Placement of stent in coronary artery");
    // The lab report's results, under it.
    expect(text).toContain("156 mg/dL");
  });

  it("shows an image inline, never as a link out", async () => {
    await render(<FhirBundleView bundle={healthImage} />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img.getAttribute("src").startsWith("data:image/jpeg;base64,")).toBe(
      true,
    );
    expect(pdfButtons().length).toBe(0);
  });

  it("names a PDF's size on its button", async () => {
    await render(<FhirBundleView bundle={healthDoc} />);
    expect(pdfButtons().length).toBe(1);
    expect(pdfButtons()[0].textContent).toMatch(/\d+(\.\d+)? KB|\d+ bytes/);
  });

  it("an invoice shows its totals and lines", async () => {
    await render(<FhirBundleView bundle={invoice} />);
    const text = container.textContent;
    expect(text).toContain("Invoice");
    expect(text).toContain("net 2752.2 INR");
    expect(text).toContain("Paracetamol 1 g oral tablet");
  });

  it("a record with odd fields renders instead of taking the page down", async () => {
    const odd = {
      entry: [
        {
          fullUrl: "urn:uuid:c",
          resource: {
            resourceType: "Composition",
            title: { odd: 1 },
            section: [
              { title: { odd: 2 }, entry: [{ reference: "urn:uuid:p" }] },
            ],
          },
        },
        {
          fullUrl: "urn:uuid:p",
          resource: {
            resourceType: "CarePlan",
            title: "Plan",
            description: { odd: 3 },
          },
        },
      ],
    };
    await render(<FhirBundleView bundle={odd} />);
    expect(container.textContent).toContain("Plan");
  });

  it("a record whose type is named like a built-in property still renders", async () => {
    const odd = {
      entry: [
        {
          resource: {
            resourceType: "Composition",
            title: "Odd",
            type: { coding: [{ code: "__proto__" }] },
          },
        },
      ],
    };
    await render(<FhirBundleView bundle={odd} />);
    expect(container.textContent).toContain("Odd");
  });
});
