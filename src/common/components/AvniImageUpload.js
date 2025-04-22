import React from "react";
import { isEmpty } from "lodash";
import { Dialog, DialogContent, Grid, IconButton, Typography } from "@material-ui/core";
import { ToolTipContainer } from "./ToolTipContainer";
import FormControl from "@material-ui/core/FormControl";
import AddAPhoto from "@material-ui/icons/AddAPhoto";
import CloseIcon from "@material-ui/icons/Close";
import MediaService from "../../adminApp/service/MediaService";

export const AvniImageUpload = ({
  toolTipKey,
  label,
  onSelect,
  onDelete = () => {},
  width = 80,
  height = 80,
  oldImgUrl,
  allowUpload = true,
  maxFileSize
}) => {
  const [, setValue] = React.useState("");
  const [file, setFile] = React.useState();
  const [iconPreview, setIconPreview] = React.useState();
  const [fileSizeError, setFileSizeError] = React.useState("");
  const [openPreview, setOpenPreview] = React.useState(false);

  React.useEffect(() => {
    if (!file) {
      setIconPreview();
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setIconPreview(objectUrl);

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  React.useEffect(() => {
    if (!isEmpty(oldImgUrl)) {
      MediaService.getMedia(oldImgUrl).then(res => {
        setIconPreview(res);
      });
    }
  }, [oldImgUrl]);

  const handleFileChange = event => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (maxFileSize && selectedFile.size > maxFileSize) {
        setFileSizeError("File size exceeds the maximum allowed size.");
        setFile(undefined);
        setValue("");
        return;
      } else {
        setFileSizeError("");
      }
      setFile(selectedFile);
      setValue(selectedFile.name);
      if (onSelect) {
        onSelect(selectedFile);
      }
    }
  };

  const deleteIcon = () => {
    setFile(null);
    onDelete();
  };

  const ImagePreview = ({ iconPreview, width, height, onDelete }) => {
    return (
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <img
          src={iconPreview}
          alt={"Preview"}
          width={width}
          height={height}
          style={{ cursor: "pointer" }}
          onClick={() => setOpenPreview(true)}
        />
        <IconButton color="secondary" aria-label="remove image" onClick={deleteIcon} size="small" style={{ marginLeft: 4 }}>
          <CloseIcon />
        </IconButton>
        <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md">
          <DialogContent style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 0 }}>
            <img
              src={iconPreview}
              alt={"Full Preview"}
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                display: "block"
              }}
              onClick={() => setOpenPreview(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  function UploadImage() {
    return (
      <React.Fragment>
        <FormControl>
          <Grid container direction="row" alignItems="center" spacing={1}>
            <Grid item>
              <Typography style={{ opacity: 0.5 }}>{label}</Typography>
            </Grid>
            {allowUpload && (
              <Grid item>
                <input accept="image/*" style={{ display: "none" }} id="icon-button-file" type="file" onChange={handleFileChange} />
                <label htmlFor="icon-button-file">
                  <IconButton color="primary" aria-label="upload picture" component="span">
                    <AddAPhoto />
                  </IconButton>
                </label>
              </Grid>
            )}
            {iconPreview && (
              <Grid item>
                <ImagePreview iconPreview={iconPreview} width={width} height={height} onDelete={deleteIcon} />
              </Grid>
            )}
            {fileSizeError && (
              <Grid item style={{ marginLeft: 8 }}>
                <FormControl error>
                  <Typography variant="caption" color="error">
                    {fileSizeError}
                  </Typography>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </FormControl>
      </React.Fragment>
    );
  }

  function UploadImageWithTooltip({ toolTipKey }) {
    return (
      <ToolTipContainer toolTipKey={toolTipKey}>
        <UploadImage />
      </ToolTipContainer>
    );
  }

  return isEmpty(toolTipKey) ? <UploadImage /> : <UploadImageWithTooltip toolTipKey={toolTipKey} />;
};
