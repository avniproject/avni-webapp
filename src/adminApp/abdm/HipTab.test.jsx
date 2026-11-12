// The HIP screen shows a visit the server links by itself (HIP_INTI_LINK_505) without anyone pressing Link.
import { act } from "react";
import { createRoot } from "react-dom/client";
import { HipTab } from "./Abdm";
import * as api from "./api";

jest.mock("./api", () => ({
  errorMessage: (e) => String(e),
  getHipPatients: jest.fn(),
  getCareContexts: jest.fn(),
  linkSubject: jest.fn(() => Promise.resolve([])),
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
  jest.useFakeTimers();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.useRealTimers();
});

const patient = (linked) => ({
  subjectUUID: "s-1",
  name: "Test Patient",
  abhaNumberMasked: "xx-xxxx-xxxx-0000",
  abhaAddress: "test.patient@abdm",
  encounters: 1,
  linked,
});
const visit = (status, error) => ({
  reference: "v-1",
  display: "Hypertension Screening",
  hiType: "OPConsultation",
  status,
  error,
});
const text = () => container.textContent;
const wait = (ms) =>
  act(async () => {
    jest.advanceTimersByTime(ms);
  });

describe("HIP · Link records", () => {
  it("shows a queued visit turn LINKED when the server links it, with no click", async () => {
    let linked = false;
    api.getHipPatients.mockImplementation(() =>
      Promise.resolve([patient(linked)]),
    );
    api.getCareContexts.mockImplementation(() =>
      Promise.resolve([visit(linked ? "LINKED" : "QUEUED")]),
    );
    await act(async () => root.render(<HipTab />));
    await act(async () => container.querySelector("tbody tr").click());

    expect(text()).toContain("Queued");
    expect(text()).toContain("links on its own within 5 minutes");
    expect(text()).toContain("Not linked");

    linked = true;
    await wait(10000);

    expect(text()).toContain("LINKED");
    expect(text()).not.toContain("Queued");
    expect(text()).not.toContain("Not linked");
    expect(api.linkSubject).not.toHaveBeenCalled();
  });

  it("shows a newly synced patient without reopening the tab", async () => {
    let list = [];
    api.getHipPatients.mockImplementation(() => Promise.resolve(list));
    await act(async () => root.render(<HipTab />));
    expect(text()).not.toContain("Test Patient");

    list = [patient(false)];
    await wait(10000);

    expect(text()).toContain("Test Patient");
  });
});

describe("HIP · no sample data", () => {
  it("offers Link to ABHA and no way to add sample records", async () => {
    api.getHipPatients.mockResolvedValue([patient(true)]);
    api.getCareContexts.mockResolvedValue([visit("LINKED")]);
    await act(async () => root.render(<HipTab />));
    await act(async () => container.querySelector("tbody tr").click());

    expect(text()).toContain("Link to ABHA");
    expect(text()).not.toMatch(/sample|test data/i);
  });
});

describe("HIP · visits not linked", () => {
  const openWith = async (row) => {
    api.getHipPatients.mockResolvedValue([patient(false)]);
    api.getCareContexts.mockResolvedValue([row]);
    await act(async () => root.render(<HipTab />));
    await act(async () => container.querySelector("tbody tr").click());
  };
  const chip = (label) =>
    [...container.querySelectorAll(".MuiChip-root")].find(
      (c) => c.textContent === label,
    );

  it("shows a visit given up for good in the error colour, with the reason", async () => {
    await openWith(
      visit(
        "FAILED_FINAL",
        "Eka refused the link: care context already linked",
      ),
    );

    expect(chip("FAILED_FINAL").className).toContain("MuiChip-colorError");
    expect(text()).toContain(
      "Eka refused the link: care context already linked",
    );
  });

  it("shows a visit waiting for a verified ABHA with the reason", async () => {
    await openWith(
      visit(
        "AWAITING_VERIFIED_ABHA",
        "Patient has no Eka ID: register or verify their ABHA through the app first",
      ),
    );

    expect(chip("AWAITING_VERIFIED_ABHA")).toBeDefined();
    expect(text()).toContain(
      "Patient has no Eka ID: register or verify their ABHA through the app first",
    );
  });
});
