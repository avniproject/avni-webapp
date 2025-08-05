import { SaveButton, useDataProvider } from "react-admin";
import { isNil, find } from "lodash";
import { useState, useEffect } from "react";

const LocationSaveButton = ({ ...props }) => {
  const [addressLevelTypes, setAddressLevelTypes] = useState([]);
  const dataProvider = useDataProvider();

  useEffect(() => {
    if (addressLevelTypes.length === 0) {
      dataProvider
        .getList("addressLevelType", {
          pagination: { page: 1, perPage: 25 },
          sort: { field: "id", order: "DESC" },
          filter: {}
        })
        .then(({ data }) => {
          const mappedTypes = Array.isArray(data)
            ? data
            : data._embedded
            ? data._embedded.addressLevelType.map(item => ({
                id: item.id,
                name: item.name,
                parentId: item.parentId
              }))
            : [];
          setAddressLevelTypes(mappedTypes);
        })
        .catch(error => {
          console.error(
            "LocationSaveButton: error fetching addressLevelTypes",
            error
          );
        });
    }
  }, [dataProvider, addressLevelTypes.length]);

  const getNameOfLocationType = typeId => {
    if (isNil(typeId)) return null;
    let type = find(addressLevelTypes, { id: typeId });
    return isNil(type) ? null : type.name;
  };

  const transform = data => {
    const typeName = getNameOfLocationType(data.typeId);
    return [
      {
        name: data.title,
        level: data.level || 1,
        type: typeName,
        parents:
          data.parentId && !isNil(data.parentId) ? [{ id: data.parentId }] : []
      }
    ];
  };

  return <SaveButton type="button" transform={transform} {...props} />;
};

export default LocationSaveButton;
