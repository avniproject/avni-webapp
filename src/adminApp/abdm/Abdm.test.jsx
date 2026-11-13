import { act } from "react";
import { createRoot } from "react-dom/client";
import Abdm, { canOpenAbdm } from "./Abdm";
import * as api from "./api";

jest.mock("./api", () => ({
  errorMessage: (e) => String(e),
  getStatus: jest.fn(),
  getHipPatients: jest.fn(() => Promise.resolve([])),
  getConsentRequests: jest.fn(() => Promise.resolve([])),
  getCareContexts: jest.fn(() => Promise.resolve([])),
  getConsentRecords: jest.fn(() => Promise.resolve([])),
  requeueFailed: jest.fn(),
}));
jest.mock("../../common/utils/httpClient", () => ({
  __esModule: true,
  httpClient: {},
  default: {},
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const status = (over = {}) => ({
  abhaEnabled: true,
  recordSharingEnabled: true,
  recordSharingOn: true,
  hiuOn: true,
  environment: "sandbox",
  hipIds: ["hip-1", "hip-2"],
  hiuId: "hiu-1",
  sharingClientConfigured: true,
  webhookUrl: "https://x.example/api/v3/eka/webhook/wh-1",
  session: { ok: true, error: null },
  privileges: { share: true, view: true },
  queue: {},
  jobs: {},
  failedShares: 0,
  unansweredShares: 0,
  ...over,
});

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

const render = async (s) => {
  api.getStatus.mockResolvedValue(s);
  await act(async () => root.render(<Abdm />));
};
const tabs = () =>
  [...container.querySelectorAll('[role="tab"]')].map((t) => t.textContent);
const text = () => container.textContent;

describe("Who may open the ABDM page", () => {
  const holding = (...types) => ({
    privileges: types.map((privilegeType) => ({ privilegeType })),
  });
  const users = [
    [
      "edit the organisation's configuration",
      holding("EditOrganisationConfiguration"),
    ],
    ["share ABDM records", holding("ShareAbdmRecords")],
    ["view ABDM records", holding("ViewAbdmRecords")],
    ["do everything", { hasAllPrivileges: true, privileges: [] }],
  ];
  const on = { enableAbha: true, enableAbdmRecordSharing: true };
  const offs = [
    { enableAbha: true },
    { enableAbdmRecordSharing: true },
    { enableAbha: true, enableAbdmRecordSharing: false },
    {},
    undefined,
  ];

  it.each(users)(
    "opens with both switches on to a user who may %s",
    (_, user) => {
      expect(canOpenAbdm(user, on)).toBe(true);
    },
  );

  it.each(users)(
    "stays closed with a switch off, even to a user who may %s",
    (_, user) => {
      for (const config of offs) expect(canOpenAbdm(user, config)).toBe(false);
    },
  );

  it("stays closed with both switches on to a user who holds none of the three", () => {
    expect(canOpenAbdm(holding("EditSubject"), on)).toBe(false);
    expect(canOpenAbdm(holding(), on)).toBe(false);
    expect(canOpenAbdm(undefined, on)).toBe(false);
  });
});

describe("ABDM page", () => {
  it("is titled ABDM and has no demo tools", async () => {
    await render(status());
    expect(text()).toContain("ABDM");
    expect(text()).not.toMatch(/demo|Traffic|Reset|sample|Approve/i);
    expect(tabs()).toEqual([
      "Status",
      "HIP · Link records",
      "HIU · Request records",
      "Records received",
    ]);
  });

  it("shows the status the server gives, and no secret", async () => {
    await render(status());
    expect(text()).toContain("sandbox");
    expect(text()).toContain("hip-1, hip-2");
    expect(text()).toContain("hiu-1");
    expect(text()).toContain("https://x.example/api/v3/eka/webhook/wh-1");
    expect(text()).toContain("OK");
    expect(text()).not.toContain("Linking on save");
  });

  it("shows why the Eka session is not OK", async () => {
    await render(status({ session: { ok: false, error: "key lapsed" } }));
    expect(text()).toContain("Not OK: key lapsed");
  });

  it("hides the HIU tabs when the organisation does not receive records", async () => {
    await render(status({ hiuOn: false, hiuId: null }));
    expect(tabs()).toEqual(["Status", "HIP · Link records"]);
  });

  it("shows only the Status tab when record sharing is not working", async () => {
    await render(status({ recordSharingOn: false, hiuOn: false }));
    expect(tabs()).toEqual(["Status"]);
    expect(text()).toContain("not working for this organisation yet");
  });

  it("shows the HIP tab only with the share privilege", async () => {
    await render(status({ privileges: { share: true, view: false } }));
    expect(tabs()).toEqual(["Status", "HIP · Link records"]);
  });

  it("shows the HIU and Records tabs only with the view privilege", async () => {
    await render(status({ privileges: { share: false, view: true } }));
    expect(tabs()).toEqual([
      "Status",
      "HIU · Request records",
      "Records received",
    ]);
  });

  it("shows the Status tab alone, naming the privileges to ask for, when the user has neither", async () => {
    await render(status({ privileges: { share: false, view: false } }));
    expect(tabs()).toEqual(["Status"]);
    expect(text()).toContain("Share ABDM records");
    expect(text()).toContain("View ABDM records");
  });

  it("does not say a privilege is missing when the user has both", async () => {
    await render(status());
    expect(text()).not.toContain("Ask your administrator");
  });

  it("says plainly that record sharing is off when the server answers 404", async () => {
    api.getStatus.mockRejectedValue(
      "ABDM record sharing is off for this organisation",
    );
    await act(async () => root.render(<Abdm />));
    expect(text()).toContain(
      "ABDM record sharing is off for this organisation",
    );
    expect(tabs()).toEqual(["Status"]);
  });

  describe("a tab it hides asks the server nothing", () => {
    const tabCalls = () =>
      [
        api.getHipPatients,
        api.getCareContexts,
        api.getConsentRequests,
        api.getConsentRecords,
      ].reduce((n, f) => n + f.mock.calls.length, 0);
    const waitAMinute = () =>
      act(async () => {
        jest.advanceTimersByTime(60000);
      });

    it.each([
      ["neither privilege", { privileges: { share: false, view: false } }],
      ["record sharing not working", { recordSharingOn: false, hiuOn: false }],
    ])("with %s", async (_, over) => {
      jest.useFakeTimers();
      try {
        await render(status(over));
        await waitAMinute();
        expect(tabs()).toEqual(["Status"]);
        expect(tabCalls()).toBe(0);
      } finally {
        jest.useRealTimers();
      }
    });

    it("while a tab it shows asks only once opened", async () => {
      jest.useFakeTimers();
      try {
        await render(status());
        await waitAMinute();
        expect(tabCalls()).toBe(0);

        const hip = [...container.querySelectorAll('[role="tab"]')].find((t) =>
          t.textContent.includes("HIP"),
        );
        await act(async () => hip.click());
        expect(api.getHipPatients).toHaveBeenCalled();
      } finally {
        jest.useRealTimers();
      }
    });
  });

  it("shows the new counts after the given-up visits are queued again", async () => {
    api.getStatus
      .mockResolvedValueOnce(status({ queue: { FAILED_FINAL: 2 } }))
      .mockResolvedValueOnce(status({ queue: { QUEUED: 2 } }));
    api.requeueFailed.mockResolvedValue({ requeued: 2 });
    await act(async () => root.render(<Abdm />));
    expect(text()).toContain("Given up");

    const queueAgain = [...container.querySelectorAll("button")].find((b) =>
      b.textContent.includes("Queue again"),
    );
    await act(async () => queueAgain.click());

    expect(api.getStatus).toHaveBeenCalledTimes(2);
    expect(text()).toContain("Waiting to be sent");
    expect(text()).not.toContain("Given up");
    expect(text()).toContain("2 visits queued again");
  });
});
