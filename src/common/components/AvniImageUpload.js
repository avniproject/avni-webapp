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
  displayDelete
}) => {
  const classes = useStyles();

  const [value, setValue] = React.useState("");
  const [file, setFile] = React.useState();
  const [iconPreview, setIconPreview] = React.useState();

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

  const onSelectWrapper = event => {
    const fileReader = new FileReader();
    event.target.files[0] && fileReader.readAsText(event.target.files[0]);
    setValue(event.target.value);
    const file = event.target.files[0];
    fileReader.onloadend = event => {
      setFile(file);
      const error = onSelect(file);
      error && !error.type && alert(error);
    };
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
                <input
                  accept="image/*"
                  className={classes.input}
                  id="contained-button-file"
                  type="file"
                  value={value}
                  onChange={onSelectWrapper}
                  style={{ display: "none" }}
                />
                <IconButton variant="contained" component="label" htmlFor="contained-button-file">
                  <AddAPhoto color="primary" />
                </IconButton>
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
