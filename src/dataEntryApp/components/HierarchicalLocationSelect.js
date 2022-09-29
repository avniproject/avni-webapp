import LocationSelect from "./LocationSelect";
import React, { useEffect, useState } from "react";
import _ from "lodash";
import { useSelector } from "react-redux";
import httpClient from "../../common/utils/httpClient";

const HierarchicalLocationSelect = ({ minLevelTypeId, onSelect, selectedLocation }) => {
  const allAddressLevelTypes = useSelector(
    state => state.dataEntry.metadata.operationalModules.allAddressLevels
  );
  const selectedAddressLevelType =
    _.isNil(selectedLocation) || _.isEqual(selectedLocation.uuid, "")
      ? _.find(allAddressLevelTypes, alt => _.isNil(alt.parent))
      : _.find(allAddressLevelTypes, alt => alt.name === selectedLocation.type);
  const [selectedAddressLevels, setSelectedAddressLevels] = useState([
    {
      addressLevelType: selectedAddressLevelType
    }
  ]);

  function setSelectedLocationWithParents(selectedLocation) {
    const result = httpClient
      .get(`/locations/parents/${selectedLocation.uuid}`)
      .then(response => {
        const selectedAddressLevelsFromSelectedLocation = _.map(response.data, l => {
          let addressLevelToPushToArray = {
            addressLevelType: addressLevelTypes.find(alt => alt.name === l.typeString),
            value: l
          };
          return addressLevelToPushToArray;
        });
        setSelectedAddressLevels(selectedAddressLevelsFromSelectedLocation);
      })
      .catch(error => {
        console.error(`Error while fetching location with id: ${selectedLocation.id}`, error);
      });

    return result;
  }

  const addressLevelTypes = allAddressLevelTypes;
  useEffect(() => {
    if (_.isNil(selectedLocation) || selectedAddressLevelType.id !== minLevelTypeId) {
      setSelectedAddressLevels([
        {
          addressLevelType: addressLevelTypes.find(alt => _.isNil(alt.parent))
        }
      ]);
    } else {
      setSelectedLocationWithParents(selectedLocation);
    }
  }, [allAddressLevelTypes, minLevelTypeId, selectedLocation]);

  const onAddressLevelSelect = (addressLevel, addressLevelType) => {
    const selectedAddressLevelsClone = [...selectedAddressLevels];
    const indexToBeChanged = _.findIndex(
      selectedAddressLevelsClone,
      addressLevel => addressLevel.addressLevelType.uuid === addressLevelType.uuid
    );
    const newSelectedAddressLevels =
      indexToBeChanged === -1
        ? selectedAddressLevelsClone
        : selectedAddressLevelsClone.splice(0, indexToBeChanged);
    newSelectedAddressLevels.push({ addressLevelType, value: addressLevel });
    setSelectedAddressLevels(newSelectedAddressLevels);
    if (finalValueAvailable(newSelectedAddressLevels)) {
      onSelect(_.last(newSelectedAddressLevels).value);
    } else {
      addNextLineIfRequired(newSelectedAddressLevels);
    }
  };

  const finalValueAvailable = newSelectedAddressLevels => {
    return _.last(newSelectedAddressLevels).value.typeId === minLevelTypeId;
  };

  const addNextLineIfRequired = newSelectedAddressLevels => {
    const lastAddressLevel = _.last(newSelectedAddressLevels);
    const nextAddressLevelType = _.find(
      addressLevelTypes,
      alt => alt.parent && alt.parent.uuid === lastAddressLevel.addressLevelType.uuid
    );
    setSelectedAddressLevels([
      ...newSelectedAddressLevels,
      { addressLevelType: nextAddressLevelType }
    ]);
  };
  return (
    <div>
      {_.map(selectedAddressLevels, ({ addressLevelType, value }, index) => {
        const parentId = index > 0 ? selectedAddressLevels[index - 1].value.id : null;
        return (
          <div style={{ marginBottom: "2px" }} key={index}>
            <LocationSelect
              parentId={parentId}
              selectedLocation={value}
              onSelect={addressLevel => onAddressLevelSelect(addressLevel, addressLevelType)}
              placeholder={"Select " + addressLevelType.name}
              typeId={addressLevelType.id}
            />
          </div>
        );
      })}
      <div />
    </div>
  );
};
export default HierarchicalLocationSelect;
