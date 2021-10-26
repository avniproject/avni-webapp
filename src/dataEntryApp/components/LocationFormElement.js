import React from "react";
import { useTranslation } from "react-i18next";
import { Concept } from "avni-models";
import LocationSelect from "./LocationSelect";
import RadioButtonsGroup from "./RadioButtonsGroup";
import { useSelector } from "react-redux";
import { selectAllAddressLevelTypes } from "../reducers/metadataReducer";
import { find, filter, includes, isEmpty, head, isNil } from "lodash";
import { ValidationError } from "./ValidationError";
import { addressLevelService } from "../services/AddressLevelService";
import http from "common/utils/httpClient";

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
  const validationResult = find(validationResults, vr => vr.formIdentifier === uuid);
  const lowestAddressLevelTypeUUIDs = concept.recordValueByKey(
    Concept.keys.lowestAddressLevelTypeUUIDs
  );
  const addressLevelTypes = filter(useSelector(selectAllAddressLevelTypes), alt =>
    includes(lowestAddressLevelTypeUUIDs, alt.uuid)
  );
  const [level, setLevel] = React.useState(head(addressLevelTypes));
  const locationUUID = isNil(observation) ? null : observation.getReadableValue();
  const [location, setLocation] = React.useState();

  React.useEffect(() => {
    if (!isEmpty(locationUUID)) {
      http
        .get(`/locations/web?uuid=${locationUUID}`)
        .then(response => {
          if (response.status === 200) {
            const location = response.data;
            setLocation(location);
            const currentLevel = addressLevelTypes.find(alt => alt.name === location.type);
            setLevel(currentLevel);
            addressLevelService.addAddressLevel(location);
          } else {
            alert(`Error while fetching location with uuid: ${locationUUID}`);
          }
        })
        .catch(error => {
          console.error(`Error while fetching location with uuid: ${locationUUID}`, error);
        });
    }
  }, [locationUUID]);

  return (
    <React.Fragment>
      <RadioButtonsGroup
        label={`${t(name)}${mandatory ? "*" : ""}`}
        items={addressLevelTypes.map(a => ({ id: a.id, name: a.name }))}
        value={level.id}
        onChange={setLevel}
      />
      <LocationSelect
        selectedLocation={location}
        onSelect={location => update(location.uuid)}
        placeholder={level.name}
        typeId={level.id}
      />
      <ValidationError validationResult={validationResult} />
    </React.Fragment>
  );
}
