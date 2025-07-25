import { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Concept } from "avni-models";
import LocationSelect from "./LocationSelect";
import RadioButtonsGroup from "./RadioButtonsGroup";
import { useSelector } from "react-redux";
import { selectAllAddressLevelTypes } from "../reducers/metadataReducer";
import { find, includes, isEmpty, isNil, orderBy } from "lodash";
import { ValidationError } from "./ValidationError";
import { addressLevelService } from "../services/AddressLevelService";
import { httpClient as http } from "common/utils/httpClient";
import { selectOrganisationConfig } from "../sagas/selectors";
import HierarchicalLocationSelect from "./HierarchicalLocationSelect";

export default function LocationFormElement({
  obsHolder,
  formElement,
  update,
  validationResults,
  uuid
}) {
  const { t } = useTranslation();
  const { mandatory, name, concept } = formElement;
  const observation = obsHolder.findObservation(concept);
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) =>
      formIdentifier === uuid &&
      questionGroupIndex === formElement.questionGroupIndex
  );
  const orgConfig = useSelector(selectOrganisationConfig);

  const lowestAddressLevelTypeUUIDs = concept.recordValueByKey(
    Concept.keys.lowestAddressLevelTypeUUIDs
  );
  const highestAddressLevelTypeUUID = concept.recordValueByKey(
    Concept.keys.highestAddressLevelTypeUUID
  );

  const allAddressLevelTypes = useSelector(selectAllAddressLevelTypes);
  const highestAddressLevelType = find(
    allAddressLevelTypes,
    alt => alt.uuid === highestAddressLevelTypeUUID
  );
  const allowedLowerAddressLevelTypes = orderBy(
    allAddressLevelTypes,
    "level",
    "asc"
  ).filter(alt => includes(lowestAddressLevelTypeUUIDs, alt.uuid));
  const lowestAddressLevelType = allowedLowerAddressLevelTypes[0];
  const applicableAddressLevelTypes = orderBy(
    allAddressLevelTypes,
    "level",
    "asc"
  ).filter(alt => alt.level <= highestAddressLevelType.level);
  const [level, setLevel] = useState(lowestAddressLevelType);
  const locationUUID = isNil(observation)
    ? null
    : observation.getReadableValue();
  const [location, setLocation] = useState();

  useEffect(() => {
    if (!isEmpty(locationUUID)) {
      http.get(`/locations/web?uuid=${locationUUID}`).then(response => {
        if (response.status === 200) {
          const location = response.data;
          const currentLevel = applicableAddressLevelTypes.find(
            alt => alt.name === location.type
          );
          setLevel(currentLevel);
          addressLevelService.addAddressLevel(location);
          setLocation(location);
        } else {
          alert(`Error while fetching location with uuid: ${locationUUID}`);
        }
      });
    }
  }, [locationUUID]);

  return (
    <Fragment>
      <RadioButtonsGroup
        label={`${t(name)}${mandatory ? "*" : ""}`}
        items={allowedLowerAddressLevelTypes.map(a => ({
          id: a.id,
          name: a.name,
          level: a.level
        }))}
        value={level.id}
        onChange={setLevel}
      />
      {orgConfig.settings.showHierarchicalLocation ? (
        <HierarchicalLocationSelect
          selectedLocation={location}
          minLevelTypeId={level.id}
          onSelect={location => {
            update(location.uuid);
          }}
        />
      ) : (
        <LocationSelect
          selectedLocation={location}
          onSelect={location => update(location.uuid)}
          placeholder={level.name}
          typeId={level.id}
        />
      )}
      <ValidationError validationResult={validationResult} />
    </Fragment>
  );
}
