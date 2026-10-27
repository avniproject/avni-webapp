// DEMO-ONLY abdm-hackathon
import { act } from "react";
import { createRoot } from "react-dom/client";
import AbdmDemo from "./AbdmDemo";

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
}));
jest.mock("../../common/utils/httpClient", () => ({
  __esModule: true,
  httpClient: {},
  default: {},
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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
});
