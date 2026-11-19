import { act } from "react";
import { createRoot } from "react-dom/client";
import commonApi from "../../../../../common/service";
import { ExtensionOption } from "./ExtensionOption";

jest.mock("../../../../../common/service", () => ({
  __esModule: true,
  default: { fetchOrganisationConfigs: jest.fn() },
}));

jest.mock("../../../../../common/utils/httpClient", () => ({
  httpClient: { idp: { getTokenParam: jest.fn() } },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  console.error.mockRestore();
});

const renderOption = () =>
  act(async () =>
    root.render(
      <ExtensionOption subjectUUIDs="" scopeType="searchResults" />,
    ),
  );

describe("ExtensionOption", () => {
  it("shows no extension buttons, and doesn't fail, when the organisation configuration can't be loaded", async () => {
    commonApi.fetchOrganisationConfigs.mockRejectedValue(new Error("500"));

    await renderOption();

    expect(console.error).toHaveBeenCalledWith(
      "Could not load the extensions",
      expect.any(Error),
    );
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });

  it("shows the search result extensions from the organisation configuration", async () => {
    commonApi.fetchOrganisationConfigs.mockResolvedValue({
      organisationConfig: {
        extensions: [
          {
            label: "Print",
            fileName: "print.html",
            extensionScope: { scopeType: "searchResults" },
          },
        ],
      },
    });

    await renderOption();

    expect(container.querySelector("button").textContent).toBe("Print");
  });
});
