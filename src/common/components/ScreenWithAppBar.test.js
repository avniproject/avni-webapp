import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { ErrorBoundary } from "react-error-boundary";
import ScreenWithAppBar from "./ScreenWithAppBar";

jest.mock("../utils/httpClient", () => ({ httpClient: {} }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;
let navigate;
let shouldThrow;
let consoleError;

const SidebarIcon = () => <span>Section</span>;
const sidebarOptions = [{ name: "Healthy screen", href: "/healthy", Icon: SidebarIcon }];

const ScreenContent = () => {
  const location = useLocation();
  if (shouldThrow) throw new Error("Screen cannot render");
  return <p>Content at {location.pathname}</p>;
};

const Screen = ({ enableLeftMenuButton }) => {
  navigate = useNavigate();
  return (
    <ErrorBoundary fallback={<p>Outer error boundary</p>}>
      <ScreenWithAppBar appbarTitle="Reports" enableLeftMenuButton={enableLeftMenuButton} sidebarOptions={sidebarOptions}>
        <ScreenContent />
      </ScreenWithAppBar>
    </ErrorBoundary>
  );
};

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  shouldThrow = true;
  consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  consoleError.mockRestore();
});

const render = async (enableLeftMenuButton, state = { app: {} }) => {
  const store = createStore(() => state);
  await act(async () =>
    root.render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/broken"]}>
          <Screen enableLeftMenuButton={enableLeftMenuButton} />
        </MemoryRouter>
      </Provider>,
    ),
  );
};

describe.each([false, true])("with a sidebar: %s", (enableLeftMenuButton) => {
  it("keeps the app bar usable and recovers through its Home button", async () => {
    await render(enableLeftMenuButton);

    expect(container.textContent).toContain("oops!");
    expect(container.textContent).not.toContain("Outer error boundary");
    expect(container.querySelectorAll("header")).toHaveLength(1);
    const appBar = container.querySelector("header");
    const home = appBar.querySelector('[aria-label="Navigate to home"]');
    expect(home).not.toBeNull();

    shouldThrow = false;
    await act(async () => home.click());

    expect(container.textContent).toContain("Content at /home");
    expect(container.textContent).not.toContain("oops!");
    expect(container.querySelector("header")).toBe(appBar);
  });

  it("resets on pathname changes, not query or fragment changes", async () => {
    await render(enableLeftMenuButton);
    expect(container.textContent).toContain("oops!");

    shouldThrow = false;
    await act(async () => navigate("/broken?page=2"));
    expect(container.textContent).toContain("oops!");
    await act(async () => navigate("/broken?page=2#details"));
    expect(container.textContent).toContain("oops!");

    await act(async () => navigate("/healthy"));
    expect(container.textContent).toContain("Content at /healthy");
    expect(container.textContent).not.toContain("oops!");
  });
});

it("keeps the sidebar available for navigating away from failed content", async () => {
  await render(true);
  const healthyScreen = [...container.querySelectorAll("[role=button]")].find((button) => button.textContent.includes("Healthy screen"));
  expect(healthyScreen).toBeDefined();

  shouldThrow = false;
  await act(async () => healthyScreen.click());

  expect(container.textContent).toContain("Content at /healthy");
  expect(container.textContent).not.toContain("oops!");
});

it("still lets the outer boundary handle errors in the app bar", async () => {
  shouldThrow = false;
  await render(false, {});
  expect(container.textContent).toBe("Outer error boundary");
});

it("renders healthy content beneath the existing app bar", async () => {
  shouldThrow = false;
  await render(false);
  expect(container.textContent).toContain("Content at /broken");
  expect(container.querySelectorAll("header")).toHaveLength(1);
  expect(container.textContent).not.toContain("oops!");
});
