import React from "react";
import { isEmpty } from "lodash";
import { Dialog, DialogContent, Grid, IconButton, Snackbar, Typography } from "@material-ui/core";
import { ToolTipContainer } from "./ToolTipContainer";
import FormControl from "@material-ui/core/FormControl";
import AddAPhoto from "@material-ui/icons/AddAPhoto";
import CloseIcon from "@material-ui/icons/Close";
import MediaService from "../../adminApp/service/MediaService";

export const ImagePreview = ({ iconPreview, width, height, onDelete }) => {
  const [openPreview, setOpenPreview] = React.useState(false);

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
      {onDelete && (
        <IconButton color="secondary" aria-label="remove image" onClick={onDelete} size="small" style={{ marginLeft: 4 }}>
          <CloseIcon />
        </IconButton>
      )}
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
        PaperProps={{
          style: {
            width: "750px",
            height: "500px",
            maxWidth: "90vw",
            maxHeight: "80vh"
          }
        }}
      >
        <DialogContent
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px",
            backgroundColor: "#f5f5f5"
          }}
        >
          <img
            src={iconPreview}
            alt={"Full Preview"}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              display: "block"
            }}
            onClick={() => setOpenPreview(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const AvniImageUpload = ({
  toolTipKey,
  label,
  onSelect,
  onDelete = () => {},
  width = 80,
  height = 80,
  oldImgUrl,
  allowUpload = true,
  maxFileSize,
  uniqueName = "0"
}) => {
  const [, setValue] = React.useState("");
  const [file, setFile] = React.useState();
  const [iconPreview, setIconPreview] = React.useState();
  const [fileError, setFileError] = React.useState("");

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
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp"];
      if (!allowedTypes.includes(selectedFile.type)) {
        setFileError("Unsupported file. File type: unknown. Use .bmp, .jpg, .jpeg, .png, .gif file");
        setFile(undefined);
        setValue("");
        return;
      } else if (maxFileSize && selectedFile.size > maxFileSize) {
        setFileError(
          `File size ${Math.round((selectedFile.size / 1024 + Number.EPSILON) * 10) /
            10} KB exceeds the maximum allowed size of ${Math.round((maxFileSize / 1024 + Number.EPSILON) * 10) / 10} KB.`
        );
        setFile(undefined);
        setValue("");
        return;
      } else {
        setFileError("");
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
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id={`icon-button-file-${uniqueName}`}
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor={`icon-button-file-${uniqueName}`}>
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
          </Grid>
        </FormControl>
        <Snackbar
          open={Boolean(fileError)}
          autoHideDuration={5000}
          onClose={() => setFileError("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          style={{ bottom: "24px" }}
        >
          <div
            style={{
              background: "#ffebee",
              borderRadius: 4,
              padding: 12,
              boxShadow: "0px 2px 8px rgba(0,0,0,0.3)",
              border: "1px solid #d32f2f"
            }}
          >
            <Typography variant="body2" style={{ color: "#c62828", fontWeight: 500 }}>
              {fileError}
            </Typography>
          </div>
        </Snackbar>
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
