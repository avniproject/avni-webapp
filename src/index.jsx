import { createRoot } from "react-dom/client";
import * as serviceWorker from "./serviceWorker";
import MainApp from "./MainApp";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { PHProvider } from "./providers";

const root = createRoot(document.getElementById("root"));
root.render(
  <PHProvider>
    <MainApp />
  </PHProvider>,
);

if (import.meta.hot) {
  import.meta.hot.accept("./MainApp", () => {
    import("./MainApp").then(({ default: NextApp }) => {
      root.render(<NextApp />);
    });
  });
}
serviceWorker.unregister();
