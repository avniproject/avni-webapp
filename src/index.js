import "es6-shim";

import ReactDOM from "react-dom/client";
import * as serviceWorker from "./serviceWorker";
import MainApp from "./MainApp";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<MainApp />);

if (module.hot) {
  module.hot.accept("./MainApp", () => {
    const NextApp = require("./MainApp").default;
    root.render(<NextApp />);
  });
}
serviceWorker.unregister();
