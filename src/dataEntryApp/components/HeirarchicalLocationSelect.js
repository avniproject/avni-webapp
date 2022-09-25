import RadioButtonsGroup from "./RadioButtonsGroup";
import LocationSelect from "./LocationSelect";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { useSelector } from "react-redux";

const HierarchicalLocationSelect = ({ typeId }) => {
  const { t } = useTranslation();
  const [selectedAddressLevels, setSelectedAddressLevels] = useState([]);
  const addressLevelTypes = useSelector(
    state => state.dataEntry.metadata.operationalModules.allAddressLevels
  );

  const onSelect = (event, typeUUID) => {
    const filteredAddressLevel = _.reject(selectedAddressLevels, (value, key) => key === typeUUID);
    setSelectedAddressLevels([{ [typeUUID]: event }, ...filteredAddressLevel]);
  };
  const findAddressLevelByUUID = uuid => {
    return _.get(_.find(selectedAddressLevels, al => al[uuid]), [uuid]);
  };
  return (
    <div>
      {_.map(addressLevelTypes, addressLevelType => {
        return _.isNil(addressLevelType.parent) ||
          !_.isNil(findAddressLevelByUUID(addressLevelType.parent.uuid)) ? (
          <div>
            <LocationSelect
              selectedLocation={findAddressLevelByUUID(addressLevelType.uuid)}
              onSelect={e => onSelect(e, addressLevelType.uuid)}
              placeholder={"Select" + addressLevelType.name}
              typeId={addressLevelType.id}
            />
          </div>
        ) : null;
      })}
      <div />
    </div>
  );
};
export default HierarchicalLocationSelect;
