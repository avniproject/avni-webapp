import React, { useState } from "react";
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

export default function AddEditContactGroup({ onClose, onSave, contactGroup }) {
  const onCloseHandler = () => onClose();
  const [label, setLabel] = useState(contactGroup ? contactGroup.label : "");
  const [description, setDescription] = useState(contactGroup ? contactGroup.description : "");
  const [error, setError] = useState(null);
  const [displayProgress, setDisplayProgress] = useState(false);

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
          <Typography variant="body1">Name</Typography>
          <TextField
            name="name"
            autoComplete="off"
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
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
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              setDisplayProgress(true);
              ContactService.addEditContactGroup(contactGroup, label, description)
                .then(() => {
                  setDisplayProgress(false);
                  onSave();
                })
                .catch(error => setError(error));
            }}
          >
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
