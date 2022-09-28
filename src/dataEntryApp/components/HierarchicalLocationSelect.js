import LocationSelect from "./LocationSelect";
import React, { useEffect, useState } from "react";
import _ from "lodash";
import { useSelector } from "react-redux";
import http from "../../common/utils/httpClient";
import { addressLevelService } from "../services/AddressLevelService";
import api from "../api";
import httpClient from "../../common/utils/httpClient";

const HierarchicalLocationSelect = ({ minLevelTypeId, onSelect, selectedLocation }) => {
  console.log("minLevelTypeId---->", minLevelTypeId);
  const allAddressLevelTypes = useSelector(
    state => state.dataEntry.metadata.operationalModules.allAddressLevels
  );
  console.log("allAddressLevelTypes", allAddressLevelTypes);
  const selectedAddressLevelType = _.isEqual(selectedLocation.uuid, "")
    ? _.find(allAddressLevelTypes, alt => _.isNil(alt.parent))
    : _.find(allAddressLevelTypes, alt => alt.name === selectedLocation.type);
  console.log("selectedAddressLevelType-->", selectedAddressLevelType);

  const [selectedAddressLevels, setSelectedAddressLevels] = useState([
    {
      addressLevelType: selectedAddressLevelType
    }
  ]);

  function setSelectedLocationWithParents(selectedLocation) {
    const result = httpClient
      .get(`/locations/parents/${selectedLocation.uuid}`)
      .then(response => {
        console.log(response.data);
        console.log(addressLevelTypes);
        const selectedAddressLevelsFromSelectedLocation = _.map(response.data, l => {
          let addressLevelToPushToArray = {
            addressLevelType: addressLevelTypes.find(alt => alt.name === l.typeString),
            value: l
          };
          console.log("addressLevelToPushToState", addressLevelToPushToArray);
          return addressLevelToPushToArray;
        });
        setSelectedAddressLevels(selectedAddressLevelsFromSelectedLocation);
        console.log("Ho gaya na bhai!!!");
      })
      .catch(error => {
        console.error(`Error while fetching location with id: ${selectedLocation.id}`, error);
      });

    return result;
  }

  console.log("selectedAddressLevelType", selectedAddressLevelType);

  const addressLevelTypes = allAddressLevelTypes;

  useEffect(() => {
    console.log("useEffect");
    console.log(selectedLocation);
    if (_.isNil(selectedLocation)) {
      console.log("inUseEffect setDefault");
      setSelectedAddressLevels([
        {
          addressLevelType: addressLevelTypes.find(alt => _.isNil(alt.parent))
        }
      ]);
    } else {
      setSelectedLocationWithParents(selectedLocation);
    }
  }, [allAddressLevelTypes, minLevelTypeId]);

  const onAddressLevelSelect = (addressLevel, addressLevelType) => {
    console.log("onAddressLevelSelect");
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
    console.log(
      "_.last(newSelectedAddressLevels).value.level",
      _.last(newSelectedAddressLevels).value
    );
    console.log("minLevelTypeId", minLevelTypeId);
    return _.last(newSelectedAddressLevels).value.id === minLevelTypeId;
  };

  const addNextLineIfRequired = newSelectedAddressLevels => {
    const lastAddressLevel = _.last(newSelectedAddressLevels);
    const nextAddressLevelType = _.find(
      addressLevelTypes,
      alt => alt.parent && alt.parent.uuid === lastAddressLevel.addressLevelType.uuid
    );
    console.log("addNextLineIfRequired");
    setSelectedAddressLevels([
      ...newSelectedAddressLevels,
      { addressLevelType: nextAddressLevelType }
    ]);
  };
  console.log("selectedAddressLevels---->", selectedAddressLevels);
  return (
    <div>
      {_.map(selectedAddressLevels, ({ addressLevelType, value }, index) => {
        const parentId = index > 0 ? selectedAddressLevels[index - 1].value.id : null;
        console.log("in render", value);
        console.log("in render addressLevelType", addressLevelType);
        return (
          <div style={{ marginBottom: "2px" }} key={index}>
            <LocationSelect
              parentId={parentId}
              selectedLocation={value}
              onSelect={addressLevel => onAddressLevelSelect(addressLevel, addressLevelType)}
              placeholder={"Select" + addressLevelType.name}
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
