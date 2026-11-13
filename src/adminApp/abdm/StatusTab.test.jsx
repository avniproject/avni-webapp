import { act } from "react";
import { createRoot } from "react-dom/client";
import { StatusTab } from "./Abdm";

import * as api from "./api";

jest.mock("./api", () => ({
  errorMessage: (e) => String(e),
  requeueFailed: jest.fn(),
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

const rows = () =>
  Object.fromEntries(
    [...container.querySelectorAll("tr")].map((r) => [
      r.cells[0].textContent,
      r.cells[1].textContent,
    ]),
  );

describe("Status tab", () => {
  it("lays out every field of the status, and offers no demo action", async () => {
    await act(async () =>
      root.render(
        <StatusTab
          status={{
            abhaEnabled: true,
            recordSharingEnabled: true,
            recordSharingOn: false,
            hiuOn: false,
            environment: "production",
            hipIds: ["h1"],
            hiuId: null,
            sharingClientConfigured: false,
            webhookUrl: null,
            session: { ok: true, error: null },
          }}
        />,
      ),
    );
    expect(rows()).toMatchObject({
      "Record sharing switched on": "Yes",
      "Record sharing working": "No",
      "Receiving records (HIU)": "No",
      "Eka environment": "production",
      "HIP IDs": "h1",
      "Sharing client set up": "No",
      "Eka session": "OK",
    });
    expect(container.querySelectorAll("button").length).toBe(0);
  });

  const full = (over = {}) => ({
    abhaEnabled: true,
    recordSharingEnabled: true,
    recordSharingOn: true,
    hiuOn: true,
    environment: "sandbox",
    hipIds: ["h1"],
    hiuId: "u1",
    sharingClientConfigured: true,
    webhookUrl: "https://x.example/w",
    session: { ok: true, error: null },
    privileges: { share: true, view: true },
    queue: { QUEUED: 4, LINKED: 10, FAILED_FINAL: 2 },
    jobs: {
      visitLinking: {
        lastSuccessAt: "2026-11-10T04:30:00.000Z",
        lastError: null,
      },
      consentUpdateRetry: {
        lastSuccessAt: null,
        lastError: "EkaCallException: refused",
      },
    },
    failedShares: 3,
    unansweredShares: 1,
    ...over,
  });
  const text = () => container.textContent;
  const button = (label) =>
    [...container.querySelectorAll("button")].find((b) =>
      b.textContent.includes(label),
    );

  it("shows the queue counts with each status in plain words", async () => {
    await act(async () => root.render(<StatusTab status={full()} />));
    expect(rows()).toMatchObject({
      "Waiting to be sent": "4",
      Linked: "10",
      "Given up": "2",
    });
    expect(text()).not.toContain("FAILED_FINAL");
  });

  it("shows each job's last success and last error", async () => {
    await act(async () => root.render(<StatusTab status={full()} />));
    expect(rows()["Linking visits"]).toContain("Last success");
    expect(rows()["Retrying consent updates"]).toContain("Never succeeded");
    expect(rows()["Retrying consent updates"]).toContain(
      "EkaCallException: refused",
    );
  });

  it("shows the failed and unanswered share counts", async () => {
    await act(async () => root.render(<StatusTab status={full()} />));
    expect(rows()["Shares that failed"]).toBe("3");
    expect(rows()["Shares Eka did not answer"]).toBe("1");
  });

  it("says when the queue and jobs are empty", async () => {
    await act(async () =>
      root.render(<StatusTab status={full({ queue: {}, jobs: {} })} />),
    );
    expect(text()).toContain("No visits are queued");
    expect(text()).toContain("No job has run yet");
  });

  it("queues the given-up visits again and says how many", async () => {
    api.requeueFailed.mockResolvedValue({ requeued: 2 });
    await act(async () => root.render(<StatusTab status={full()} />));
    await act(async () => button("Queue again").click());
    expect(api.requeueFailed).toHaveBeenCalledTimes(1);
    expect(text()).toContain("2 visits queued again");
  });

  it("says when none were queued again", async () => {
    api.requeueFailed.mockResolvedValue({ requeued: 0 });
    await act(async () => root.render(<StatusTab status={full()} />));
    await act(async () => button("Queue again").click());
    expect(text()).toContain("No visits were queued again");
  });

  it("shows the error when queuing again fails", async () => {
    api.requeueFailed.mockRejectedValue(
      "You do not have the privilege for this",
    );
    await act(async () => root.render(<StatusTab status={full()} />));
    await act(async () => button("Queue again").click());
    expect(text()).toContain("You do not have the privilege for this");
  });

  it("offers Queue again only with the share privilege", async () => {
    await act(async () =>
      root.render(
        <StatusTab
          status={full({ privileges: { share: false, view: true } })}
        />,
      ),
    );
    expect(button("Queue again")).toBeUndefined();
  });

  it("copes with a status that carries no queue, jobs or privileges", async () => {
    await act(async () =>
      root.render(<StatusTab status={{ recordSharingOn: false }} />),
    );
    expect(button("Queue again")).toBeUndefined();
  });
});
