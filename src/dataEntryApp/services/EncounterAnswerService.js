import { Concept } from "avni-models";
import { filter, includes, isEmpty, isNil, map, some } from "lodash";
import api from "../api";
import { mapEncounter } from "../../common/subjectModelMapper";
import { conceptService, i18n } from "./ConceptService";
import { addressLevelService } from "./AddressLevelService";
import { subjectService } from "./SubjectService";

const DEFAULT_IDENTIFIER = "{Date}";

export const encounterIdentifier = (concept) => concept.recordValueByKey(Concept.keys.encounterIdentifier) || DEFAULT_IDENTIFIER;

const needsObservations = (identifier) => some(identifier.match(/{.*?}/g), (token) => token !== DEFAULT_IDENTIFIER);

const encounterLookup = (encounters) => ({
  findByUUID: (uuid) => encounters.find((encounter) => encounter.uuid === uuid),
});

export const encounterLabel = (encounter, identifier, encounters = []) =>
  encounter.getEncounterLabel(identifier, {
    conceptService,
    subjectService,
    addressLevelService,
    i18n: new i18n(),
    encounterService: encounterLookup(encounters),
  });

const loadEncounters = (listedEncounters, identifier) =>
  needsObservations(identifier)
    ? Promise.all(map(listedEncounters, ({ uuid }) => api.fetchEncounter(uuid).then(mapEncounter)))
    : Promise.resolve(map(listedEncounters, (encounter) => mapEncounter({ ...encounter, observations: [] })));

// The visits the phone offers: this subject's non-voided visits of the concept's encounter type,
// narrowed by the rule's answers to show and to exclude (EncounterSelectFormElementHelper).
export const loadEncounterOptions = (formElement, subjectUUID) => {
  const concept = formElement.concept;
  if (concept.recordValueByKey(Concept.keys.encounterScope) !== Concept.encounterScopes.withinSubject || isNil(subjectUUID))
    return Promise.resolve([]);
  const encounterTypeUUID = concept.recordValueByKey(Concept.keys.encounterTypeUUID);
  const { answersToShow, answersToExclude } = formElement;
  return api
    .fetchSubjectGeneral(subjectUUID)
    .catch(() => ({ encounters: [] }))
    .then((subject) => {
      const ofType = filter(
        subject && subject.encounters,
        (encounter) => !encounter.voided && encounter.encounterType && encounter.encounterType.uuid === encounterTypeUUID,
      );
      const shown = isEmpty(answersToShow) ? ofType : filter(ofType, ({ uuid }) => includes(answersToShow, uuid));
      const applicable = isEmpty(answersToExclude) ? shown : filter(shown, ({ uuid }) => !includes(answersToExclude, uuid));
      return loadEncounters(applicable, encounterIdentifier(concept));
    })
    .then((encounters) =>
      map(encounters, (encounter) => ({
        uuid: encounter.uuid,
        name: encounterLabel(encounter, encounterIdentifier(concept), encounters),
      })),
    );
};

export const loadEncounterAnswerLabels = (concept, encounterUUIDs) =>
  Promise.all(
    map(encounterUUIDs, (uuid) =>
      api
        .fetchEncounter(uuid)
        .then(mapEncounter)
        .then((encounter) => encounterLabel(encounter, encounterIdentifier(concept)))
        .catch(() => uuid),
    ),
  );
