// DEMO-ONLY abdm-hackathon
import { act } from "react";
import { createRoot } from "react-dom/client";
import AbdmDemo from "./AbdmDemo";
import * as api from "./api";

jest.mock("./api", () => ({
  errorMessage: (e) => String(e),
  getStatus: jest.fn(() =>
    Promise.resolve({
      clientId: "cid-1",
      hipId: "hip-1",
      hiuId: "hiu-1",
      publicBaseUrl: "https://x.example",
      ekaBaseUrl: "https://api.dev.eka.care",
      webhookUrl: "https://x.example/api/v3/eka/webhook",
      session: { ok: true },
    }),
  ),
  getMessages: jest.fn(),
}));
jest.mock("../../common/utils/httpClient", () => ({
  __esModule: true,
  httpClient: {},
  default: {},
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const render = async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => root.render(<AbdmDemo />));
  return { container, root };
};

const openTab = async (container, label) => {
  const tab = [...container.querySelectorAll('[role="tab"]')].find(
    (t) => t.textContent === label,
  );
  await act(async () => tab.click());
};

const clickRowWith = async (container, text) => {
  const row = [...container.querySelectorAll("tr")].find((r) =>
    r.textContent.includes(text),
  );
  await act(async () => row.click());
};

beforeEach(() => jest.clearAllMocks());

describe("AbdmDemo", () => {
  it("shows the Eka banner and the webhook address on the Status tab", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => root.render(<AbdmDemo />));
    expect(container.textContent).toContain(
      "Eka Care ABDM Connect — Eka's bridge to NHA",
    );
    expect(container.textContent).toContain("hip-1");
    expect(container.textContent).toContain(
      "https://x.example/api/v3/eka/webhook",
    );
    expect(container.textContent).not.toContain("Registries");
    await act(async () => root.unmount());
    container.remove();
  });

  // The 27 Oct cleanup deleted the Traffic tab with the Registries tab, and opening it blanked the whole page.
  it("opens the Traffic tab and lists the ABDM messages", async () => {
    api.getMessages.mockResolvedValue([
      {
        id: 1,
        direction: "OUT",
        method: "POST",
        path: "eka:/abdm/v1/hip/care-context/data/on-fetch",
        requestId: "r-1",
        httpStatus: 202,
        createdAt: "2026-10-27T05:00:00.000Z",
        body: { status: "***" },
      },
    ]);
    const { container, root } = await render();
    await openTab(container, "Traffic");
    expect(api.getMessages).toHaveBeenCalledWith(100);
    expect(container.textContent).toContain(
      "eka:/abdm/v1/hip/care-context/data/on-fetch",
    );
    expect(container.textContent).toContain("202");
    await clickRowWith(container, "on-fetch");
    expect(container.textContent).toContain('"status": "***"');
    await act(async () => root.unmount());
    container.remove();
  });

  it("shows an empty traffic log", async () => {
    api.getMessages.mockResolvedValue([]);
    const { container, root } = await render();
    await openTab(container, "Traffic");
    expect(container.textContent).toContain("Refresh");
    await act(async () => root.unmount());
    container.remove();
  });

  it("shows a message whose body is plain text", async () => {
    api.getMessages.mockResolvedValue([
      {
        id: 2,
        direction: "IN",
        method: "POST",
        path: "/api/v3/eka/webhook#abha.hip_data_fetch",
        requestId: "wh-1",
        httpStatus: 202,
        createdAt: "2026-10-27T05:01:00.000Z",
        body: "not json",
      },
    ]);
    const { container, root } = await render();
    await openTab(container, "Traffic");
    await clickRowWith(container, "hip_data_fetch");
    expect(container.textContent).toContain("not json");
    await act(async () => root.unmount());
    container.remove();
  });
});
