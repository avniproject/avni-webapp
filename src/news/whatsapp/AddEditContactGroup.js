import React, { useCallback, useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import {
  DialogActions,
  DialogTitle,
  Input,
  LinearProgress,
  TextField,
  Typography
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import { Close } from "@material-ui/icons";
import Box from "@material-ui/core/Box";
import ErrorMessage from "../../common/components/ErrorMessage";
import Button from "@material-ui/core/Button";
import ContactService from "../api/ContactService";
import _ from "lodash";

export default function AddEditContactGroup({ onClose, onSave, contactGroup }) {
  const onCloseHandler = () => onClose();
  const [label, setLabel] = useState(contactGroup ? contactGroup.label : "");
  const [description, setDescription] = useState(contactGroup ? contactGroup.description : "");
  const [error, setError] = useState(null);
  const [displayProgress, setDisplayProgress] = useState(false);

  const onNameEdit = useCallback(e => {
    setLabel(e.target.value);
    setError(null);
  }, []);

  const onSaveClick = useCallback(() => {
    if (_.isEmpty(label)) {
      setError(new Error("Name is mandatory"));
      return;
    }

    setDisplayProgress(true);
    ContactService.addEditContactGroup(contactGroup, label, description)
      .then(() => {
        setDisplayProgress(false);
        onSave();
      })
      .catch(error => {
        if (error.response.statusText === "Conflict")
          setError(new Error("Another contact group with the same name already exists."));
        else setError(error);
        setDisplayProgress(false);
      });
  }, [label, description]);

  return (
    <Dialog
      onClose={onCloseHandler}
      aria-labelledby="customized-dialog-title"
      open={true}
      fullScreen
    >
      <DialogTitle
        id="customized-dialog-title"
        onClose={onCloseHandler}
        style={{ backgroundColor: "black", color: "white" }}
      >
        Add Contact Group
      </DialogTitle>
      <DialogActions>
        <IconButton onClick={onCloseHandler}>
          <Close />
        </IconButton>
      </DialogActions>
      <Box style={{ padding: 40 }}>
        {error && (
          <Box style={{ marginBottom: 40 }}>
            <ErrorMessage error={error} />
          </Box>
        )}
        <Box>
          <Typography variant="body1">Name *</Typography>
          <TextField
            name="name"
            autoComplete="off"
            type="text"
            value={label}
            onChange={onNameEdit}
          />
        </Box>
        <Box style={{ marginTop: 40 }}>
          <Typography variant="body1">Description</Typography>
          <Input
            multiline
            value={description}
            style={{ width: "100%" }}
            onChange={e => setDescription(e.target.value)}
          />
        </Box>
        {displayProgress && <LinearProgress style={{ marginTop: 40 }} />}
        <Box style={{ marginTop: 40, display: "flex", flexDirection: "row-reverse" }}>
          <Button color="primary" variant="contained" onClick={onSaveClick}>
            Save
          </Button>
          <Button
            color="secondary"
            variant="outlined"
            onClick={() => onCloseHandler()}
            style={{ marginRight: 10 }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
