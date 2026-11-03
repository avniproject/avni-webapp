import { act } from "react";
import { createRoot } from "react-dom/client";
import { StorageManagementConfig } from "./StorageManagementConfig";
import { httpClient as http } from "../../../common/utils/httpClient";

jest.mock("../../../common/components/AvniFormLabel", () => ({
  AvniFormLabel: ({ label }) => <label>{label}</label>,
}));
jest.mock("../../../common/components/DocumentationContainer", () => ({
  DocumentationContainer: ({ children }) => <div>{children}</div>,
}));
jest.mock("react-admin", () => ({ Title: () => null }));
jest.mock("../../../common/utils/httpClient", () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;

const render = async (element) => {
  await act(async () => root.render(element));
};

const click = async (element) => {
  await act(async () => element.click());
};

beforeEach(() => {
  jest.clearAllMocks();
  http.get.mockReturnValue(Promise.resolve({ data: null }));
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("StorageManagementConfig - Error message formatting (Bug A)", () => {
  it("displays local validation error without 'undefined' prefix when SQL query is empty", async () => {
    await render(<StorageManagementConfig />);

    const saveButton = [...container.querySelectorAll("button")].find(
      (btn) => btn.textContent.trim() === "Save",
    );
    await click(saveButton);

    expect(container.textContent).toContain("SQL Query cannot be empty");
    expect(container.textContent).not.toContain("undefined");
  });

  it("includes response.data in error message when server responds with an error", async () => {
    http.get.mockReturnValue(
      Promise.resolve({ data: { sqlQuery: "SELECT id FROM individual" } }),
    );
    http.post.mockReturnValue(
      Promise.reject({
        message: "Request failed with status code 400",
        response: { data: "Syntax error near WHERE" },
      }),
    );

    await render(<StorageManagementConfig />);

    const saveButton = [...container.querySelectorAll("button")].find(
      (btn) => btn.textContent.trim() === "Save",
    );
    await click(saveButton);

    expect(container.textContent).toContain(
      "Syntax error near WHERE (Request failed with status code 400)",
    );
  });
});

describe("StorageManagementConfig - Remove action (Bug B)", () => {
  it("disables Remove button when there is no saved configuration", async () => {
    await render(<StorageManagementConfig />);

    const removeButton = [...container.querySelectorAll("button")].find(
      (btn) => btn.textContent.trim() === "Remove",
    );
    expect(removeButton).toBeDefined();
    expect(removeButton.disabled).toBe(true);
  });

  it("enables Remove button when a saved configuration is loaded", async () => {
    http.get.mockReturnValue(
      Promise.resolve({
        data: {
          id: 123,
          uuid: "config-uuid",
          sqlQuery: "SELECT id FROM individual WHERE voided = false",
        },
      }),
    );

    await render(<StorageManagementConfig />);

    const removeButton = [...container.querySelectorAll("button")].find(
      (btn) => btn.textContent.trim() === "Remove",
    );
    expect(removeButton.disabled).toBe(false);

    const input =
      container.querySelector("textarea[name='sqlQuery']") ||
      container.querySelector("input[name='sqlQuery']");
    expect(input.value).toBe("SELECT id FROM individual WHERE voided = false");
  });

  it("posts config with isVoided: true, resets form and shows success snackbar on Remove", async () => {
    const savedConfig = {
      id: 123,
      uuid: "config-uuid",
      sqlQuery: "SELECT id FROM individual WHERE voided = false",
    };
    http.get.mockReturnValue(Promise.resolve({ data: savedConfig }));
    http.post.mockReturnValue(Promise.resolve({ data: {} }));

    await render(<StorageManagementConfig />);

    const removeButton = [...container.querySelectorAll("button")].find(
      (btn) => btn.textContent.trim() === "Remove",
    );
    await click(removeButton);

    expect(http.post).toHaveBeenCalledWith("/web/storageManagementConfig", {
      ...savedConfig,
      isVoided: true,
    });

    expect(container.textContent).toContain("Removed App Storage Config");

    const input =
      container.querySelector("textarea[name='sqlQuery']") ||
      container.querySelector("input[name='sqlQuery']");
    expect(input.value).toBe("");
    expect(removeButton.disabled).toBe(true);
  });

  it("handles remove failure and shows error snackbar", async () => {
    http.get.mockReturnValue(
      Promise.resolve({
        data: {
          id: 123,
          uuid: "config-uuid",
          sqlQuery: "SELECT id FROM individual",
        },
      }),
    );
    http.post.mockReturnValue(
      Promise.reject({
        message: "Failed to void config",
        response: { data: "Database constraint error" },
      }),
    );

    await render(<StorageManagementConfig />);

    const removeButton = [...container.querySelectorAll("button")].find(
      (btn) => btn.textContent.trim() === "Remove",
    );
    await click(removeButton);

    expect(container.textContent).toContain(
      "Database constraint error (Failed to void config)",
    );
  });

  it("disables Save and Remove buttons while a request is in flight", async () => {
    let resolvePost;
    http.get.mockReturnValue(
      Promise.resolve({
        data: { id: 1, sqlQuery: "SELECT id FROM individual" },
      }),
    );
    http.post.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      }),
    );

    await render(<StorageManagementConfig />);

    const saveButton = [...container.querySelectorAll("button")].find(
      (btn) => btn.textContent.trim() === "Save",
    );
    const removeButton = [...container.querySelectorAll("button")].find(
      (btn) => btn.textContent.trim() === "Remove",
    );

    expect(saveButton.disabled).toBe(false);
    expect(removeButton.disabled).toBe(false);

    await click(saveButton);

    expect(saveButton.disabled).toBe(true);
    expect(removeButton.disabled).toBe(true);

    await act(async () => {
      resolvePost({ data: { id: 1, sqlQuery: "SELECT id FROM individual" } });
    });

    expect(saveButton.disabled).toBe(false);
    expect(removeButton.disabled).toBe(false);
  });
});
