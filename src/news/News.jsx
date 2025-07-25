import { Routes, Route } from "react-router-dom";
import NewsList from "./NewsList";
import NewsDetails from "./NewsDetails";

function News() {
  return (
    <Routes>
      <Route index element={<NewsList />} />
      <Route path=":id/details" element={<NewsDetails />} />
    </Routes>
  );
}

export default News;
