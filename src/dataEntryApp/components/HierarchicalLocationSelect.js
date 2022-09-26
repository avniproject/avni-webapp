import LocationSelect from "./LocationSelect";
import React, { useEffect, useState } from "react";
import _ from "lodash";
import { useSelector } from "react-redux";

const HierarchicalLocationSelect = ({ onSelect }) => {
  const [selectedAddressLevels, setSelectedAddressLevels] = useState([]);
  const addressLevelTypes = useSelector(
    state => state.dataEntry.metadata.operationalModules.allAddressLevels
  );

  const logAndSetSelectedAddressLevels = item => {
    console.log(item);
    setSelectedAddressLevels(item);
  };

  useEffect(() => {
    const addressLevelType = addressLevelTypes.find(alt => _.isNil(alt.parent));
    logAndSetSelectedAddressLevels([{ addressLevelType }]);
  }, [addressLevelTypes]);

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
    logAndSetSelectedAddressLevels(newSelectedAddressLevels);
    if (finalValueAvailable(newSelectedAddressLevels)) {
      onSelect(_.last(newSelectedAddressLevels).value);
    } else {
      addNextLineIfRequired(newSelectedAddressLevels);
    }
  };

  const finalValueAvailable = newSelectedAddressLevels => {
    const currentLength = newSelectedAddressLevels.length;
    const expectedLength = addressLevelTypes.length;
    return expectedLength <= currentLength;
  };

  const addNextLineIfRequired = newSelectedAddressLevels => {
    const lastAddressLevel = _.last(newSelectedAddressLevels);
    const nextAddressLevelType = _.find(
      addressLevelTypes,
      alt => alt.parent && alt.parent.uuid === lastAddressLevel.addressLevelType.uuid
    );
    logAndSetSelectedAddressLevels([
      ...newSelectedAddressLevels,
      { addressLevelType: nextAddressLevelType }
    ]);
  };

  return (
    <div>
      {_.map(selectedAddressLevels, ({ addressLevelType, value }, index) => {
        const parentId = index > 0 ? selectedAddressLevels[index - 1].value.id : null;
        console.log("in render", addressLevelType, parentId);
        return (
          <div style={{ marginBottom: "2px" }} key={addressLevelType.uuid}>
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
