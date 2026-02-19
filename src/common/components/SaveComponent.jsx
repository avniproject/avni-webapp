import { useState } from "react";
import { Button } from "@mui/material";
import { isEmpty } from "lodash";
import { Save } from "@mui/icons-material";
import ActivityIndicatorModal from "./ActivityIndicatorModal";

export const SaveComponent = ({
  disabledFlag = false,
  name = "SAVE",
  fullWidth = false,
  onSubmit,
  showOverlay = true,
  ...props
}) => {
  const [saveInProgress, setSaveInProgress] = useState(false);

  const enableSaveButton = () => {
    setSaveInProgress(false);
  };
  const disableSaveButton = () => {
    setSaveInProgress(true);
  };

  const onSave = async (event) => {
    disableSaveButton();
    try {
      await onSubmit(event);
    } finally {
      enableSaveButton();
    }
  };

  return (
    <>
      <Button
        color="primary"
        variant="contained"
        onClick={onSave}
        style={isEmpty(props.styles) ? {} : props.styles}
        disabled={disabledFlag || saveInProgress}
        fullWidth={fullWidth}
        startIcon={<Save />}
      >
        {name.toUpperCase()}
      </Button>
      {showOverlay && <ActivityIndicatorModal open={saveInProgress} />}
    </>
  );
};
