import fs from "fs";
import path from "path";

// downloadSample serves this file as it is, so what the implementer sees is what is on disk.
const sample = fs
  .readFileSync(path.resolve(__dirname, "../../public/bulkuploads/sample/usersAndCatchments.csv"), "utf8")
  .trim()
  .split("\n");

describe("Users & Catchments sample file", () => {
  it("has the ABHA Health Facility ID column", () => {
    expect(sample[0].split(",")).toContain("ABHA Health Facility ID");
  });

  it("keeps every example row as wide as the header", () => {
    const width = sample[0].split(",").length;
    sample.slice(1).forEach((row) => {
      // The example rows hold no commas inside quotes beyond the location, so count outside quotes.
      expect(row.replace(/"[^"]*"/g, "x").split(",").length).toBe(width);
    });
  });
});
