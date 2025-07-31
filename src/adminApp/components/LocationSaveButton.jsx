import { SaveButton } from "react-admin";
import { isNil } from "lodash";

const LocationSaveButton = ({ ...props }) => {
  const transform = data => {
    const typeName = data.type;
    return [
      {
        name: data.title,
        level: data.level || 1,
        type: typeName,
        parents:
          data.parentId && !isNil(data.parentId)
            ? [{ id: data.parentId }]
            : [{}]
      }
    ];
  };

  return <SaveButton type="button" transform={transform} {...props} />;
};

export default LocationSaveButton;
