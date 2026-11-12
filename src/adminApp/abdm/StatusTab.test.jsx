import { act } from "react";
import { createRoot } from "react-dom/client";
import { StatusTab } from "./Abdm";

jest.mock("./api", () => ({ errorMessage: (e) => String(e) }));
jest.mock("../../common/utils/httpClient", () => ({
  __esModule: true,
  httpClient: {},
  default: {},
}));

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
});
