import { useCreate, SaveButton, useNotify, useRedirect } from "react-admin";
import { useFormContext } from "react-hook-form";

const LocationSaveButton = ({ resource = "locations", ...props }) => {
  const [create, { isLoading }] = useCreate();
  const notify = useNotify();
  const redirect = useRedirect();
  const { handleSubmit } = useFormContext();

  const onSave = data => {
    const payload = [
      {
        name: data.title,
        level: data.level,
        type: data.type || data.typeString,
        parents: [{ id: data.parentId }]
      }
    ];

    create(
      resource,
      { data: payload },
      {
        onSuccess: () => {
          notify("Location created", { type: "info" });
          redirect("list", resource);
        },
        onError: error => {
          notify(`Error: ${error.message}`, { type: "error" });
        }
      }
    );
  };

  return (
    <SaveButton
      {...props}
      saving={isLoading}
      handleSubmitWithRedirect={handleSubmit(onSave)}
    />
  );
};

export default LocationSaveButton;
