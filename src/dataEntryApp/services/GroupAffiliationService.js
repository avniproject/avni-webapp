import { Concept, Observation } from "avni-models";
import { PrimitiveValue } from "openchs-models";
import { compact, filter, find, flatMap, get, includes, isEmpty, map } from "lodash";

// The phone saves a GroupAffiliation answer as a group membership, not as an observation
// (GroupAffiliationActions, GroupSubjectService.addSubjectToGroup). During the web form the chosen
// group is held as the question's answer so the page check and the summary see it; on save it
// is taken out of the observations and sent as a membership instead.

const GROUP_SUBJECT_TYPE_UUID = "groupSubjectTypeUUID";
const GROUP_SUBJECT_ROLE_UUID = "groupSubjectRoleUUID";

export const groupSubjectTypeUUID = (formElement) => formElement.recordValueByKey(GROUP_SUBJECT_TYPE_UUID);
export const groupSubjectRoleUUID = (formElement) => formElement.recordValueByKey(GROUP_SUBJECT_ROLE_UUID);

export const groupAffiliationFormElements = (formElements) =>
  filter(formElements, (fe) => get(fe, "concept.datatype") === Concept.dataType.GroupAffiliation && !fe.voided);

export const withoutGroupAffiliationObservations = (resourceObservations, formElements) => {
  const conceptUUIDs = map(groupAffiliationFormElements(formElements), (fe) => fe.concept.uuid);
  return filter(resourceObservations, (observation) => !includes(conceptUUIDs, observation.conceptUUID));
};

// As GroupSubjectService.getFirstGroupForMember on the phone: the subject's membership in a group of
// the question's group subject type, in the question's role.
const membershipFor = (formElement, memberships) =>
  find(
    memberships,
    (membership) =>
      !membership.voided &&
      membership.groupRoleUUID === groupSubjectRoleUUID(formElement) &&
      get(membership, "groupSubjectSubjectType.uuid") === groupSubjectTypeUUID(formElement),
  );

const chosenGroupUUID = (formElement, observations) => {
  const observation = find(observations, (obs) => get(obs, "concept.uuid") === formElement.concept.uuid);
  return observation ? observation.getValueWrapper().getValue() : null;
};

export const membershipRequests = ({ formElements, observations, memberships, memberSubjectUUID, now, newUuid }) =>
  flatMap(groupAffiliationFormElements(formElements), (formElement) => {
    const chosen = chosenGroupUUID(formElement, observations);
    if (isEmpty(chosen)) return [];
    const existing = membershipFor(formElement, memberships);
    if (existing && existing.groupSubjectUUID === chosen) return [];
    return compact([
      existing && {
        uuid: existing.uuid,
        groupSubjectUUID: existing.groupSubjectUUID,
        memberSubjectUUID,
        groupRoleUUID: existing.groupRoleUUID,
        membershipEndDate: now.toISOString(),
        voided: true,
      },
      {
        uuid: newUuid(),
        groupSubjectUUID: chosen,
        memberSubjectUUID,
        groupRoleUUID: groupSubjectRoleUUID(formElement),
        membershipStartDate: now.toISOString(),
        voided: false,
      },
    ]);
  });

export const observationsFromMemberships = (formElements, memberships) =>
  compact(
    map(groupAffiliationFormElements(formElements), (formElement) => {
      const existing = membershipFor(formElement, memberships);
      return (
        existing &&
        Observation.create(formElement.concept, new PrimitiveValue(existing.groupSubjectUUID, Concept.dataType.GroupAffiliation))
      );
    }),
  );
