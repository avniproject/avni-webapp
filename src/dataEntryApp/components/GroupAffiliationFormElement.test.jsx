jest.mock("react-markdown", () => () => null);
jest.mock("rehype-raw", () => () => null);
jest.mock("rehype-sanitize", () => () => null);
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Concept, ObservationsHolder } from "openchs-models";
import { FormElement } from "./FormElement";
import formElementService from "../services/FormElementService";
import {
  groupAffiliationFormElements,
  membershipRequests,
  observationsFromMemberships,
  withoutGroupAffiliationObservations,
} from "../services/GroupAffiliationService";
import EntityFactory from "../test/EntityFactory";
import TestKeyValueFactory from "../test/TestKeyValueFactory";

jest.mock("react-redux", () => ({
  useSelector: (selector) => selector({ app: { userInfo: null } }),
}));
jest.mock("../services/SubjectSearchService", () => ({
  __esModule: true,
  default: { search: jest.fn(() => Promise.resolve({ listOfRecords: [] })) },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const GROUP_TYPE = "st-household";
const ROLE = "role-member";
const MEMBER = "subject-member";
const NOW = new Date("2026-11-01T10:00:00.000Z");

const gaElement = ({
  mandatory = true,
  uuid = "fe-ga",
  conceptUuid = "c-ga",
  role = ROLE,
} = {}) =>
  EntityFactory.createFormElement2({
    uuid,
    name: "Household link",
    concept: EntityFactory.createConcept2({
      uuid: conceptUuid,
      name: "Household link",
      dataType: Concept.dataType.GroupAffiliation,
    }),
    displayOrder: 1,
    mandatory,
    type: "SingleSelect",
    keyValues: [
      TestKeyValueFactory.create({
        key: "groupSubjectTypeUUID",
        value: GROUP_TYPE,
      }),
      TestKeyValueFactory.create({ key: "groupSubjectRoleUUID", value: role }),
    ],
  });

const textElement = () =>
  EntityFactory.createFormElement2({
    uuid: "fe-text",
    name: "Note",
    concept: EntityFactory.createConcept2({
      uuid: "c-text",
      name: "Note",
      dataType: Concept.dataType.Text,
    }),
    displayOrder: 2,
  });

const membership = (overrides = {}) => ({
  uuid: "membership-1",
  groupSubjectUUID: "group-A",
  groupSubjectName: "Household A",
  memberSubjectUUID: MEMBER,
  groupRoleUUID: ROLE,
  groupSubjectSubjectType: { uuid: GROUP_TYPE },
  membershipStartDate: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const chose = (formElement, groupUuid) => {
  const holder = new ObservationsHolder([]);
  formElementService.updateObservations(holder, formElement, groupUuid);
  return holder.observations;
};

const counter = () => {
  let n = 0;
  return () => `new-${++n}`;
};

describe("GroupAffiliation answer during the form (#1658)", () => {
  it("holds the chosen group, so a mandatory question passes the page check once a group is chosen", () => {
    const fe = gaElement();
    const observations = chose(fe, "group-A");
    expect(
      new ObservationsHolder(observations)
        .findObservation(fe.concept)
        .getValueWrapper()
        .getValue(),
    ).toBe("group-A");
    expect(
      formElementService.validateIfIsMandatoryAndValueEmptyOrNull(fe, "group-A")
        .success,
    ).toBe(true);
    expect(
      formElementService.validateIfIsMandatoryAndValueEmptyOrNull(fe, null)
        .success,
    ).toBe(false);
  });
});

describe("GroupAffiliation on save: a group membership, as the phone saves it, not an observation (#1658)", () => {
  it("finds the GroupAffiliation questions of a form", () => {
    expect(
      groupAffiliationFormElements([gaElement(), textElement()]).map(
        (fe) => fe.uuid,
      ),
    ).toEqual(["fe-ga"]);
  });

  it("drops the GroupAffiliation answer from the observations sent with the subject", () => {
    const fe = gaElement();
    const resourceObservations = [
      { conceptUUID: "c-ga", value: "group-A" },
      { conceptUUID: "c-text", value: "kept" },
    ];
    expect(
      withoutGroupAffiliationObservations(resourceObservations, [fe]),
    ).toEqual([{ conceptUUID: "c-text", value: "kept" }]);
  });

  it("adds the new subject to the chosen group in the question's role", () => {
    const fe = gaElement();
    expect(
      membershipRequests({
        formElements: [fe],
        observations: chose(fe, "group-A"),
        memberships: [],
        memberSubjectUUID: MEMBER,
        now: NOW,
        newUuid: counter(),
      }),
    ).toEqual([
      {
        uuid: "new-1",
        groupSubjectUUID: "group-A",
        memberSubjectUUID: MEMBER,
        groupRoleUUID: ROLE,
        membershipStartDate: NOW.toISOString(),
        voided: false,
      },
    ]);
  });

  it("changes nothing when the subject is already in the chosen group", () => {
    const fe = gaElement();
    expect(
      membershipRequests({
        formElements: [fe],
        observations: chose(fe, "group-A"),
        memberships: [membership()],
        memberSubjectUUID: MEMBER,
        now: NOW,
        newUuid: counter(),
      }),
    ).toEqual([]);
  });

  it("ends the old membership and starts a new one when another group is chosen", () => {
    const fe = gaElement();
    expect(
      membershipRequests({
        formElements: [fe],
        observations: chose(fe, "group-B"),
        memberships: [membership()],
        memberSubjectUUID: MEMBER,
        now: NOW,
        newUuid: counter(),
      }),
    ).toEqual([
      {
        uuid: "membership-1",
        groupSubjectUUID: "group-A",
        memberSubjectUUID: MEMBER,
        groupRoleUUID: ROLE,
        membershipEndDate: NOW.toISOString(),
        voided: true,
      },
      {
        uuid: "new-1",
        groupSubjectUUID: "group-B",
        memberSubjectUUID: MEMBER,
        groupRoleUUID: ROLE,
        membershipStartDate: NOW.toISOString(),
        voided: false,
      },
    ]);
  });

  it("leaves memberships in other roles alone", () => {
    const fe = gaElement();
    expect(
      membershipRequests({
        formElements: [fe],
        observations: chose(fe, "group-A"),
        memberships: [
          membership({
            uuid: "other-role",
            groupRoleUUID: "role-head",
            groupSubjectUUID: "group-Z",
          }),
        ],
        memberSubjectUUID: MEMBER,
        now: NOW,
        newUuid: counter(),
      }).map((r) => r.uuid),
    ).toEqual(["new-1"]);
  });

  it("when editing, starts the question at the group the subject already belongs to in that role", () => {
    const fe = gaElement();
    const observations = observationsFromMemberships(
      [fe],
      [
        membership({ uuid: "other-role", groupRoleUUID: "role-head" }),
        membership(),
      ],
    );
    expect(observations).toHaveLength(1);
    expect(observations[0].concept.uuid).toBe("c-ga");
    expect(observations[0].getValueWrapper().getValue()).toBe("group-A");
  });
});

describe("GroupAffiliation question on screen", () => {
  let container;
  let root;
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("draws a group picker instead of the not-supported notice", async () => {
    await act(async () =>
      root.render(
        <FormElement
          feIndex={0}
          validationResults={[]}
          filteredFormElements={[]}
          update={() => {}}
          value={null}
        >
          {gaElement()}
        </FormElement>,
      ),
    );
    expect(
      container.querySelector('[data-testid="unsupported-form-element"]'),
    ).toBeNull();
    expect(container.textContent).toContain("Household link");
    expect(container.querySelector("input")).not.toBeNull();
  });
});
