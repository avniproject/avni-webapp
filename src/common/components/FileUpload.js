import React from "react";
import { isEmpty } from "lodash";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

export default ({ onSelect, onUpload, canSelect, canUpload }) => {
  const [value, setValue] = React.useState("");

  const onSelectWrapper = event => {
    const fileReader = new FileReader();
    event.target.files[0] && fileReader.readAsText(event.target.files[0]);
    setValue(event.target.value);
    const file = event.target.files[0];
    fileReader.onloadend = event => {
      const error = onSelect(event.target.result, file);
      error && alert(error);
    };
  };

  const onUploadWrapper = () => {
    onUpload();
    setValue("");
  };

  return (
    <Grid container direction="row" spacing={1} pad={2}>
      <Grid container item xs={12} sm={6}>
        <Button variant="contained" component="label" disabled={!canSelect}>
          Choose File
          <input type="file" value={value} onChange={onSelectWrapper} style={{ display: "none" }} />
        </Button>
      </Grid>
      <Grid container item xs={12} sm={6}>
        <Button
          variant="contained"
          color="primary"
          aria-haspopup="false"
          onClick={onUploadWrapper}
          disabled={!canUpload || isEmpty(value)}
        >
          Upload
        </Button>
      </Grid>
    </Grid>
  );
};
