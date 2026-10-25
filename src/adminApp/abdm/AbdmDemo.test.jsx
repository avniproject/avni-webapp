// DEMO-ONLY abdm-hackathon
import { act } from "react";
import { createRoot } from "react-dom/client";
import AbdmDemo from "./AbdmDemo";

jest.mock("./api", () => ({
  errorMessage: (e) => String(e),
  getStatus: jest.fn(() =>
    Promise.resolve({
      mode: "mock",
      clientId: "cid-1",
      hipId: "hip-1",
      hiuId: "hiu-1",
      publicBaseUrl: "https://x.example",
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
  it("shows the mock banner on the Status tab", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => root.render(<AbdmDemo />));
    expect(container.textContent).toContain(
      "Consent manager: MOCK — a local stand-in for NHA's gateway",
    );
    expect(container.textContent).toContain("hip-1");
    await act(async () => root.unmount());
    container.remove();
  });
});
