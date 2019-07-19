import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./components/Dashboard";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const app = (
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
  ReactDOM.render(app, div);
  ReactDOM.unmountComponentAtNode(div);
});
