import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { ErrorBoundary } from "react-error-boundary";
import i18n from "i18next";
import DataEntry from "./DataEntry";

jest.mock("../common/utils/httpClient", () => ({ httpClient: {} }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;
let navigate;
let store;
let consoleError;

const Navigation = () => {
  navigate = useNavigate();
  return null;
};

beforeAll(async () => {
  await i18n.init({
    lng: "en",
    resources: {
      en: { translation: { register: "Register", search: "Search", news: "News" } },
    },
  });
});

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  consoleError.mockRestore();
});

const render = async (userInfo = { username: "health-worker" }) => {
  const state = {
    app: { userInfo },
    dataEntry: {
      metadata: {
        operationalModules: {
          subjectTypes: [{ name: "Patient", type: "Person" }],
        },
        rulesBundleLoaded: true,
        rulesLoaded: true,
      },
      news: { isNewsAvailable: true, newsList: [] },
      subjectProfile: null,
      subjectGenerel: {},
      subjectProgram: {},
      registration: {},
      viewVisitReducer: {},
      programEncounterReducer: {},
      encounterReducer: {},
    },
    translationsReducer: { orgConfig: {} },
  };
  store = createStore((currentState = state, action) =>
    action.type === "RESTORE_SUBJECT_PROFILE"
      ? { ...currentState, dataEntry: { ...currentState.dataEntry, subjectProfile: { dashboardLoaded: true } } }
      : currentState,
  );
  await act(async () =>
    root.render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/app/subject"]}>
          <Navigation />
          <Routes>
            <Route
              path="/app/*"
              element={
                <ErrorBoundary fallback={<p>Outer error boundary</p>}>
                  <DataEntry />
                </ErrorBoundary>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    ),
  );
};

it("keeps the app bar and recovers by following its News link", async () => {
  await render();

  expect(container.textContent).toContain("oops!");
  expect(container.textContent).not.toContain("Outer error boundary");
  expect(container.querySelectorAll("header")).toHaveLength(1);
  const appBar = container.querySelector("header");
  const news = appBar.querySelector('a[href="/app/news"]');
  expect(news).not.toBeNull();

  await act(async () => news.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));

  expect(container.textContent).toContain("News broadcast");
  expect(container.textContent).not.toContain("oops!");
  expect(container.querySelector("header")).toBe(appBar);
});

it("keeps the registration menu working after a dashboard render failure", async () => {
  await render();
  const register = [...container.querySelectorAll("header button")].find((button) => button.textContent.includes("Register"));
  expect(register).toBeDefined();
  await act(async () => register.click());

  const patient = container.querySelector('a[href="/app/register?type=Patient"]');
  expect(patient).not.toBeNull();
  expect(patient.textContent).toContain("Patient");
  expect(container.textContent).toContain("oops!");
  await act(async () => register.click());
  expect(register.getAttribute("aria-controls")).toBeNull();
});

it("resets only when the pathname changes", async () => {
  await render();
  expect(container.textContent).toContain("oops!");

  await act(async () => store.dispatch({ type: "RESTORE_SUBJECT_PROFILE" }));
  await act(async () => navigate("/app/subject?uuid=another-patient"));
  expect(container.textContent).toContain("oops!");
  await act(async () => navigate("/app/subject?uuid=another-patient#details"));
  expect(container.textContent).toContain("oops!");

  await act(async () => navigate("/app/subject/subjectProfile"));
  expect(container.querySelector("header")).not.toBeNull();
  expect(container.textContent).not.toContain("oops!");
});

it("still lets the outer boundary handle errors in the app bar", async () => {
  await render(null);
  expect(container.textContent).toBe("Outer error boundary");
});
