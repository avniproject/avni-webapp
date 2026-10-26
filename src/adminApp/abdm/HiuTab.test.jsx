// DEMO-ONLY abdm-hackathon
// The HIU screens against NHA's M3 cases (HIU_FLOW_102, 104, 202, 301), from the 26 Oct 2026 compliance run.
import { act } from "react";
import { createRoot } from "react-dom/client";
import { HiuTab, RecordsTab, isAbhaAddress, canOpenAbdm } from "./AbdmDemo";
import * as api from "./api";

jest.mock("./api", () => ({
  errorMessage: (e) => String(e),
  getConsentRequests: jest.fn(() => Promise.resolve([])),
  createConsentRequest: jest.fn(() =>
    Promise.resolve({ uuid: "u-1", status: "REQUESTED" }),
  ),
  getConsentRecords: jest.fn(() => Promise.resolve([])),
}));
jest.mock("../../common/utils/httpClient", () => ({
  __esModule: true,
  httpClient: {},
  default: {},
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;
beforeEach(() => {
  jest.clearAllMocks();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

const render = (element) => act(async () => root.render(element));
const field = (name) => container.querySelector(`[name="${name}"]`);
const setValue = async (el, value) => {
  const proto =
    el.tagName === "SELECT"
      ? window.HTMLSelectElement.prototype
      : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
  await act(async () =>
    el.dispatchEvent(
      new window.Event(el.tagName === "SELECT" ? "change" : "input", {
        bubbles: true,
      }),
    ),
  );
};
const click = (el) => act(async () => el.click());
const button = (text) =>
  [...container.querySelectorAll("button")].find((b) =>
    b.textContent.includes(text),
  );

describe("HIU · Request records", () => {
  it("sends the purpose, the record types and the expiry chosen", async () => {
    await render(<HiuTab status={{ mode: "eka" }} onViewRecords={() => {}} />);

    await setValue(field("abhaAddress"), "shyam@sbx");
    await setValue(field("purposeCode"), "PUBHLTH");
    await click(
      container.querySelector('input[name="hiType"][value="Prescription"]'),
    );
    await setValue(field("expiry"), "2026-12-31");
    await click(button("Request consent"));

    expect(api.createConsentRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        abhaAddress: "shyam@sbx",
        purposeCode: "PUBHLTH",
        hiTypes: ["OPConsultation", "Prescription"],
        expiry: "2026-12-31",
      }),
    );
  });

  it("will not send something that is not an ABHA address", async () => {
    await render(<HiuTab status={{ mode: "eka" }} onViewRecords={() => {}} />);

    await setValue(field("abhaAddress"), "rm -rf /");

    expect(button("Request consent").disabled).toBe(true);
    expect(container.textContent).toContain("Not an ABHA address");
    expect(isAbhaAddress("Shyam Kumar")).toBe(false);
    expect(isAbhaAddress("shyam")).toBe(true);
    expect(isAbhaAddress("shyam.k@sbx")).toBe(true);
    expect(isAbhaAddress("shyam@gmail.com")).toBe(false);
  });

  it("lists the patient, what was granted, and when each status came", async () => {
    api.getConsentRequests.mockResolvedValue([
      {
        uuid: "u-1",
        abhaAddress: "ramesh.gond@sbx",
        patientName: "Ramesh Gond",
        abhaNumber: "xx-xxxx-xxxx-9012",
        consentRequestId: "cr-1",
        purposeCode: "CAREMGT",
        hiTypes: ["OPConsultation", "Prescription"],
        from: "2026-01-01T00:00:00.000Z",
        to: "2026-10-25T23:59:59.000Z",
        expiry: "2026-11-25T00:00:00.000Z",
        status: "GRANTED",
        statusHistory: [
          { status: "REQUESTED", at: "2026-10-25T10:00:00.000Z" },
          { status: "GRANTED", at: "2026-10-25T10:05:00.000Z" },
        ],
        createdAt: "2026-10-25T10:00:00.000Z",
        artefacts: [],
      },
    ]);

    await render(<HiuTab status={{ mode: "eka" }} onViewRecords={() => {}} />);

    const text = container.textContent;
    expect(text).toContain("Ramesh Gond");
    expect(text).toContain("xx-xxxx-xxxx-9012");
    expect(text).toContain("Care management");
    expect(text).toContain("OPConsultation, Prescription");
    expect(text).toContain("1 Jan 2026");
    expect(text).toContain("25 Nov 2026");
    expect(text).toContain("REQUESTED 25 Oct 2026");
    expect(text).toContain("GRANTED 25 Oct 2026");
  });
});

describe("Refreshing by itself", () => {
  const later = (ms) =>
    act(async () => {
      jest.advanceTimersByTime(ms);
    });

  it("shows a withdrawal that comes after the grant, with no click", async () => {
    jest.useFakeTimers();
    try {
      let status = "GRANTED";
      api.getConsentRequests.mockImplementation(() =>
        Promise.resolve([
          {
            uuid: "u-1",
            abhaAddress: "ramesh.gond@sbx",
            status,
            statusHistory: [],
            artefacts: [],
          },
        ]),
      );
      await render(
        <HiuTab status={{ mode: "eka" }} onViewRecords={() => {}} />,
      );
      expect(container.textContent).toContain("GRANTED");

      status = "REVOKED";
      await later(10000);

      expect(container.textContent).toContain("REVOKED");
    } finally {
      jest.useRealTimers();
    }
  });

  it("shows records that arrive after the tab was opened", async () => {
    jest.useFakeTimers();
    try {
      let records = [];
      api.getConsentRecords.mockImplementation(() => Promise.resolve(records));
      await render(
        <RecordsTab
          request={{
            uuid: "u-1",
            abhaAddress: "ramesh.gond@sbx",
            status: "GRANTED",
          }}
        />,
      );
      expect(container.textContent).toContain("No records received yet.");

      records = [
        {
          careContextReference: "visit-1",
          hipId: "TANUH",
          receivedAt: "2026-10-26T11:00:00.000Z",
          checksumMatched: true,
          bundle: { resourceType: "Bundle", entry: [] },
        },
      ];
      await later(10000);

      expect(container.textContent).toContain("visit-1");
    } finally {
      jest.useRealTimers();
    }
  });
});

describe("Records", () => {
  it("shows no records for a consent the patient withdrew, and does not ask for them", async () => {
    await render(
      <RecordsTab
        request={{
          uuid: "u-1",
          abhaAddress: "ramesh.gond@sbx",
          status: "REVOKED",
        }}
      />,
    );

    expect(container.textContent).toContain(
      "the patient withdrew this consent",
    );
    expect(api.getConsentRecords).not.toHaveBeenCalled();
  });

  it("shows no records for a consent that has expired", async () => {
    await render(
      <RecordsTab
        request={{
          uuid: "u-1",
          abhaAddress: "ramesh.gond@sbx",
          status: "EXPIRED",
        }}
      />,
    );

    expect(container.textContent).toContain("expired");
    expect(api.getConsentRecords).not.toHaveBeenCalled();
  });
});

describe("Who may open the ABDM page", () => {
  it("only a user who may edit the organisation's configuration", () => {
    expect(
      canOpenAbdm({
        privileges: [{ privilegeType: "EditOrganisationConfiguration" }],
      }),
    ).toBe(true);
    expect(canOpenAbdm({ hasAllPrivileges: true, privileges: [] })).toBe(true);
    expect(
      canOpenAbdm({ privileges: [{ privilegeType: "EditSubject" }] }),
    ).toBe(false);
  });
});
