import UploadTypes from "./UploadTypes";

describe("UploadTypes.names", () => {
  test("filters out upload types explicitly marked voided", () => {
    const uploadTypes = new UploadTypes({
      "Encounter---Normal": { name: "Normal Encounter" },
      "Encounter---Voided": { name: "Voided Encounter", voided: true },
    });

    expect(uploadTypes.names.map((x) => x.name)).toEqual(["Normal Encounter"]);
  });

  test("filters out upload types whose name contains 'voided'", () => {
    const uploadTypes = new UploadTypes({
      "Encounter---Normal": { name: "Normal Encounter" },
      "Encounter---X": { name: "Voided Encounter" },
    });

    expect(uploadTypes.names.map((x) => x.name)).toEqual(["Normal Encounter"]);
  });

  test("filters out upload types whose code contains 'voided'", () => {
    const uploadTypes = new UploadTypes({
      "Normal---X": { name: "Normal" },
      "Voided---X": { name: "Normal 2" },
    });

    expect(uploadTypes.names.map((x) => x.name)).toEqual(["Normal"]);
  });
});
