import UploadTypes from "./UploadTypes";

describe("UploadTypes", () => {
  it("should initialize types and filter out voided ones", () => {
    const types = {
      "Encounter---Regular": { name: "Regular", voided: false },
      "Encounter---Voided": { name: "Voided", voided: true },
    };

    const uploadTypes = new UploadTypes(types);

    // It should only have the non-voided type
    expect(uploadTypes.names).toEqual([{ name: "Regular" }]);
    expect(uploadTypes.getName("Encounter---Regular")).toBe("Regular");

    // The voided type should have been removed
    expect(uploadTypes.getName("Encounter---Voided")).toBeUndefined();
    expect(uploadTypes.getCode("Voided")).toBeUndefined();
  });

  it("should return correct code and name for non-voided types", () => {
    const types = {
      "Subject---Location": { name: "Location" },
    };

    const uploadTypes = new UploadTypes(types);
    expect(uploadTypes.getCode("Location")).toBe("Subject---Location");
    expect(uploadTypes.getName("Subject---Location")).toBe("Location");
  });

  it("should return false for isApprovalEnabled when not set", () => {
    const types = {
      "Encounter---Regular": { name: "Regular" },
    };

    const uploadTypes = new UploadTypes(types);
    expect(uploadTypes.isApprovalEnabled("Regular")).toBe(false);
  });

  it("should return true for isApprovalEnabled when set to true, and false if voided", () => {
    const types = {
      "Subject---Approval": { name: "Approval Needed", approvalEnabled: true },
      "Subject---VoidedApproval": { name: "Voided Approval", approvalEnabled: true, voided: true },
    };

    const uploadTypes = new UploadTypes(types);
    expect(uploadTypes.isApprovalEnabled("Approval Needed")).toBe(true);
    // Even if approvalEnabled is true, if it is voided, it should be filtered out and return false
    expect(uploadTypes.isApprovalEnabled("Voided Approval")).toBe(false);
  });

  it("should safely handle and filter out null or undefined entries", () => {
    const types = {
      "Encounter---Regular": { name: "Regular" },
      "Bad---Entry": null,
      "AlsoBad---Entry": undefined,
    };

    const uploadTypes = new UploadTypes(types);

    expect(uploadTypes.names).toEqual([{ name: "Regular" }]);
    expect(uploadTypes.getName("Bad---Entry")).toBeUndefined();
    expect(uploadTypes.getName("AlsoBad---Entry")).toBeUndefined();
    expect(uploadTypes.getCode(undefined)).toBeUndefined();
  });
});
