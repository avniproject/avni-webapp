import React from "react";
import { isEmpty } from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button } from "@material-ui/core";
import { IconButton } from "@material-ui/core";
import { ToolTipContainer } from "./ToolTipContainer";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import http from "../utils/httpClient";
import AddAPhoto from "@material-ui/icons/AddAPhoto";

const useStyles = makeStyles(theme => ({
  item: {
    marginLeft: theme.spacing(2)
  }
}));

export const AvniImageUpload = ({ toolTipKey, label, onSelect, width, height, oldImgUrl }) => {
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
      http
        .get(http.withParams(`/media/signedUrl`, { url: oldImgUrl }))
        .then(res => res.data)
        .then(res => {
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
      error && alert(error);
    };
  };

  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <FormControl>
        <Grid
          container
          direction="column"
          justify="left"
          alignItems="center"
          style={{ paddingLeft: 40, paddingTop: 10, marginBottom: 5 }}
        >
          <Grid item>
            <InputLabel id={label}>{label}</InputLabel>
          </Grid>
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
        </Grid>
      </FormControl>
      <Grid item>{iconPreview && <img src={iconPreview} width={width} height={height} />}</Grid>
    </ToolTipContainer>
  );
};
