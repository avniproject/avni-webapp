// DEMO-ONLY abdm-hackathon
// Linking on save is switched on the Status tab, so linking from the patient's app can be tested on visits nothing has
// linked yet (HIP_INTI_LINK_505).
import React, { useState } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { StatusTab } from "./AbdmDemo";
import * as api from "./api";

jest.mock("./api", () => ({
  errorMessage: (e) => String(e),
  getStatus: jest.fn(),
  setAutoLink: jest.fn(),
  registerBridgeUrl: jest.fn(),
  getBridgeServices: jest.fn(),
  resetDemo: jest.fn(),
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

const Holder = () => {
  const [status, setStatus] = useState(null);
  return <StatusTab status={status} setStatus={setStatus} />;
};
const button = (text) =>
  [...container.querySelectorAll("button")].find((b) =>
    b.textContent.includes(text),
  );

describe("Status · linking on save", () => {
  it("shows linking on save and switches it off", async () => {
    api.getStatus.mockResolvedValue({
      mode: "eka",
      session: { ok: true },
      autoLink: true,
    });
    api.setAutoLink.mockResolvedValue({ autoLink: false });
    await act(async () => root.render(<Holder />));

    expect(container.textContent).toContain("Linking on save");
    expect(container.textContent).toContain("On");

    await act(async () => button("Switch off").click());

    expect(api.setAutoLink).toHaveBeenCalledWith(false);
    expect(container.textContent).toContain("Off");
    expect(button("Switch on")).toBeTruthy();
  });
});
