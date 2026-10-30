import ClientSideTableUtil from "./ClientSideTableUtil";
import { assert } from "chai";

const videos = [
  { title: "Handwashing", duration: 30 },
  { title: "Breastfeeding", duration: 120 },
  { title: "NUTRITION", duration: 9 },
];
const titles = (result) => result.data.map((video) => video.title);

describe("ClientSideTableUtil.sortAndPage", () => {
  it("sorts by the chosen column ignoring case, in both directions", () => {
    assert.deepEqual(titles(ClientSideTableUtil.sortAndPage(videos, { page: 0, pageSize: 10, orderBy: "title", orderDirection: "asc" })), [
      "Breastfeeding",
      "Handwashing",
      "NUTRITION",
    ]);
    assert.deepEqual(titles(ClientSideTableUtil.sortAndPage(videos, { page: 0, pageSize: 10, orderBy: "title", orderDirection: "desc" })), [
      "NUTRITION",
      "Handwashing",
      "Breastfeeding",
    ]);
  });

  it("sorts numbers by value, not as text", () => {
    assert.deepEqual(
      titles(ClientSideTableUtil.sortAndPage(videos, { page: 0, pageSize: 10, orderBy: "duration", orderDirection: "asc" })),
      ["NUTRITION", "Handwashing", "Breastfeeding"],
    );
  });

  it("sorts by a nested column", () => {
    const relationshipTypes = [{ individualAIsToBRelation: { name: "Mother" } }, { individualAIsToBRelation: { name: "father" } }];
    const result = ClientSideTableUtil.sortAndPage(relationshipTypes, {
      page: 0,
      pageSize: 10,
      orderBy: "individualAIsToBRelation.name",
      orderDirection: "asc",
    });
    assert.deepEqual(
      result.data.map((row) => row.individualAIsToBRelation.name),
      ["father", "Mother"],
    );
  });

  it("returns only the requested page and counts every row", () => {
    const wards = Array.from({ length: 12 }, (_, i) => ({ title: `Ward ${String(i + 1).padStart(2, "0")}` }));
    const secondPage = ClientSideTableUtil.sortAndPage(wards, { page: 1, pageSize: 10, orderBy: "title", orderDirection: "asc" });
    assert.deepEqual(titles(secondPage), ["Ward 11", "Ward 12"]);
    assert.equal(secondPage.totalCount, 12);
  });

  it("keeps the original order when no column is chosen", () => {
    assert.deepEqual(titles(ClientSideTableUtil.sortAndPage(videos, { page: 0, pageSize: 2 })), ["Handwashing", "Breastfeeding"]);
  });
});
