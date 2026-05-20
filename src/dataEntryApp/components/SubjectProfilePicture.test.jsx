// Regression test for avniproject/avni-webapp#1542.
// Renders SubjectProfilePicture with the props the bug-report URL produced:
// `subjectType={null}` (from SubjectCardView for group members) and a
// subjectTypeName that the operationalModules state does not contain.
// Pre-fix this threw "Cannot read properties of undefined (reading 'type')".
import React from "react";
import { renderToString } from "react-dom/server";
import { Provider } from "react-redux";
import { createStore } from "redux";
import SubjectProfilePicture from "./SubjectProfilePicture";

const storeWith = (subjectTypes) =>
  createStore(() => ({
    dataEntry: { metadata: { operationalModules: { subjectTypes } } },
  }));

const baseProps = {
  allowEnlargementOnClick: false,
  firstName: "Test",
  profilePicture: null,
  size: 25,
  style: {},
};

const renderWithStore = (store, props) =>
  renderToString(
    React.createElement(
      Provider,
      { store },
      React.createElement(SubjectProfilePicture, props),
    ),
  );

describe("SubjectProfilePicture", () => {
  it("renders the person fallback when subjectType is null and the store has no match (avni-webapp#1542)", () => {
    const html = renderWithStore(storeWith([]), {
      ...baseProps,
      subjectType: null,
      subjectTypeName: "UnknownTypeNotInStore",
    });
    expect(html).toContain('src="/icons/person.png"');
  });

  it("renders the person fallback when subjectType is an empty SubjectType shell from a relationship", () => {
    // mapSubjectType(undefined) produces this shape on individualB.
    const emptyShell = { uuid: undefined, name: undefined, type: undefined };
    const html = renderWithStore(storeWith([]), {
      ...baseProps,
      subjectType: emptyShell,
      subjectTypeName: undefined,
    });
    expect(html).toContain('src="/icons/person.png"');
  });

  it("uses the store entry when subjectType is null but the name matches operationalModules", () => {
    const mother = {
      uuid: "st-mother",
      name: "Mother",
      type: "Person",
      allowProfilePicture: false,
    };
    const html = renderWithStore(storeWith([mother]), {
      ...baseProps,
      subjectType: null,
      subjectTypeName: "Mother",
    });
    expect(html).toContain('src="/icons/person.png"');
  });

  it("uses the household icon when the resolved subject type is a Household", () => {
    const household = { uuid: "st-h", name: "Household", type: "Household" };
    const html = renderWithStore(storeWith([household]), {
      ...baseProps,
      subjectType: household,
      subjectTypeName: "Household",
    });
    expect(html).toContain('src="/icons/household.png"');
  });
});
