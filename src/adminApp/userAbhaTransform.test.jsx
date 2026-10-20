import { act } from "react";
import { createRoot } from "react-dom/client";
import { UserCreate, UserEdit } from "./user";

// Create and Edit are stubbed to record the transform each screen hands them; nothing else of
// react-admin is drawn. The transform is what turns a cleared ABHA field into "".
const mockCaptured = {};
jest.mock(
  "react-admin",
  () =>
    new Proxy(
      {},
      {
        get: (target, name) => {
          if (name === "__esModule") return true;
          if (name === "Create" || name === "Edit")
            return (props) => {
              mockCaptured[name] = props;
              return null;
            };
          return () => null;
        },
      },
    ),
);
jest.mock("../common/components/DocumentationContainer", () => ({
  DocumentationContainer: ({ children }) => children,
}));
// ES modules jest cannot load here; this test draws no markdown.
jest.mock("react-markdown", () => () => null);
jest.mock("rehype-raw", () => () => null);
jest.mock("rehype-sanitize", () => () => null);

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

it("the create screen adds the username suffix and sends a cleared health centre as an empty string", async () => {
  await act(async () =>
    root.render(
      <UserCreate userInfo={{ usernameSuffix: "demo" }} organisation={{}} />,
    ),
  );

  expect(
    mockCaptured.Create.transform({
      username: "ravi",
      settings: { abhaHipId: null },
    }),
  ).toEqual({ username: "ravi@demo", settings: { abhaHipId: "" } });
});

it("the edit screen sends a cleared health centre as an empty string", async () => {
  await act(async () => root.render(<UserEdit organisation={{}} />));

  expect(
    mockCaptured.Edit.transform({ settings: { abhaHipId: null } }),
  ).toEqual({ settings: { abhaHipId: "" } });
});
