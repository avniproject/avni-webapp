import { Route, Routes } from "react-router-dom";
import DocumentationList from "./DocumentationList";

function DocumentationRoutes() {
  return (
    <Routes>
      <Route index element={<DocumentationList />} />
    </Routes>
  );
}

export default DocumentationRoutes;
