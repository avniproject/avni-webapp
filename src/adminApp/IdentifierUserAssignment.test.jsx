jest.mock("react-markdown", () => () => null);
jest.mock("rehype-raw", () => () => null);
jest.mock("rehype-sanitize", () => () => null);

import * as IdentifierUserAssignment from "./IdentifierUserAssignment";

describe("IdentifierUserAssignment (#1564)", () => {
  it("offers no edit screen: an assigned identifier range must not be changed after creation", () => {
    expect(
      IdentifierUserAssignment.IdentifierUserAssignmentEdit,
    ).toBeUndefined();
  });

  it("still offers list, show and create", () => {
    expect(IdentifierUserAssignment.IdentifierUserAssignmentList).toBeDefined();
    expect(
      IdentifierUserAssignment.IdentifierUserAssignmentDetail,
    ).toBeDefined();
    expect(
      IdentifierUserAssignment.IdentifierUserAssignmentCreate,
    ).toBeDefined();
  });
});
