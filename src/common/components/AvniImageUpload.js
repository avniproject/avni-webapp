import React from "react";
import { isEmpty } from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid, IconButton, Typography } from "@material-ui/core";
import { ToolTipContainer } from "./ToolTipContainer";
import FormControl from "@material-ui/core/FormControl";
import AddAPhoto from "@material-ui/icons/AddAPhoto";
import CloseIcon from "@material-ui/icons/Close";
import MediaService from "../../adminApp/service/MediaService";

const useStyles = makeStyles(theme => ({
  item: {
    marginLeft: theme.spacing(2)
  }
}));

export const AvniImageUpload = ({
  toolTipKey,
  label,
  onSelect,
  width,
  height,
  oldImgUrl,
  allowUpload,
  onDelete,
  displayDelete,
  maxFileSize
}) => {
  const classes = useStyles();

  const [value, setValue] = React.useState("");
  const [file, setFile] = React.useState();
  const [iconPreview, setIconPreview] = React.useState();
  const [fileSizeError, setFileSizeError] = React.useState("");

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

  const renderPreview = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
        <img src={iconPreview} alt={"Preview"} width={width} height={height} />
        {displayDelete && (
          <Button style={{ float: "left", color: "red" }} onClick={deleteIcon}>
            <CloseIcon />
          </Button>
        )}
      </div>
    );
  };

  function renderUploadImage() {
    return (
      <React.Fragment>
        <FormControl>
          <Grid container direction="row" alignItems="center">
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
                {fileSizeError && (
                  <FormControl error>
                    <Typography variant="caption" color="error">
                      {fileSizeError}
                    </Typography>
                  </FormControl>
                )}
              </Grid>
            )}
          </Grid>
        </FormControl>
        <Grid item>{iconPreview && renderPreview()}</Grid>
      </React.Fragment>
    );
  }

  function renderWithTooltip(toolTipKey) {
    return <ToolTipContainer toolTipKey={toolTipKey}>{renderUploadImage()}</ToolTipContainer>;
  }

  return isEmpty(toolTipKey) ? renderUploadImage() : renderWithTooltip(toolTipKey);
};
