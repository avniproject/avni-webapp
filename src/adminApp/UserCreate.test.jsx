import { act } from "react";
import { createRoot } from "react-dom/client";
import { AdminContext } from "react-admin";
import { UserCreate } from "./user";
import { validateConfirmPassword } from "./UserHelper";

// #1765: a form-level validate on SimpleForm becomes the react-hook-form resolver in
// react-admin v5 and silently switches off every input-level validate prop.

jest.mock("../common/components/ToolTipContainer", () => ({
  ToolTipContainer: ({ children }) => <div>{children}</div>,
}));
jest.mock("../common/components/DocumentationContainer", () => ({
  DocumentationContainer: ({ children }) => <div>{children}</div>,
}));
jest.mock("./components/CatchmentSelectInput", () => ({
  CatchmentSelectInput: () => null,
}));
jest.mock("./components/ResetPasswordButton", () => () => null);
jest.mock("./components/EnableDisableButton", () => () => null);
jest.mock("common/utils/httpClient", () => ({
  httpClient: {
    idp: { idpType: "none" },
    get: () => new Promise(() => {}),
  },
}));

const render = async (dataProvider) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <AdminContext dataProvider={dataProvider}>
        <UserCreate
          resource="user"
          userInfo={{ usernameSuffix: "demoorg" }}
          organisation={{ region: "IN" }}
        />
      </AdminContext>,
    );
  });
  return { container, root };
};

const type = async (input, value) => {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set;
  await act(async () => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

describe("User create form validation (#1765)", () => {
  beforeAll(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
  });

  it("rejects a username containing whitespace on save, without calling the server", async () => {
    const dataProvider = {
      create: jest.fn(() => Promise.resolve({ data: { id: 1 } })),
    };
    const { container, root } = await render(dataProvider);

    const username = container.querySelector("input[name='username']");
    expect(username).not.toBeNull();
    await type(username, "test  ");

    const save = [...container.querySelectorAll("button")].find((b) =>
      /save/i.test(b.textContent),
    );
    await act(async () => {
      save.click();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(container.textContent).toContain(
      "This field should not contain whitespaces",
    );
    expect(dataProvider.create).not.toHaveBeenCalled();
    act(() => root.unmount());
  });

  it("confirm password validator keeps the 'Password does not match' message", () => {
    expect(validateConfirmPassword("abc", { password: "abd" })).toBe(
      "Password does not match",
    );
    expect(validateConfirmPassword("abc", { password: "abc" })).toBeUndefined();
  });
});
