import React from "react";
import { makeStyles } from "@mui/styles";
import { Button, GridLegacy as Grid } from "@mui/material";

const useStyles = makeStyles(theme => ({
  item: {
    marginLeft: theme.spacing(2)
  }
}));

export default ({ onSelect, onUpload, canSelect, canUpload }) => {
  const classes = useStyles();

  const onSelectWrapper = event => {
    const fileReader = new FileReader();
    event.target.files[0] && fileReader.readAsText(event.target.files[0]);
    const file = event.target.files[0];
    fileReader.onloadend = event => {
      const error = onSelect(event.target.result, file);
      error && alert(error);
    };
  };

  const handleClick = event => {
    event.target.value = null;
  };

  const onUploadWrapper = () => {
    onUpload();
  };

  return (
    <Grid
      container
      direction="row"
      spacing={1}
      sx={{
        justifyContent: "flex-start"
      }}
    >
      <Button variant="contained" component="label" disabled={!canSelect} className={classes.item}>
        Choose File
        <input type="file" onChange={onSelectWrapper} onClick={handleClick} style={{ display: "none" }} />
      </Button>
      <Button
        variant="contained"
        color="primary"
        aria-haspopup="false"
        onClick={onUploadWrapper}
        disabled={!canUpload}
        className={classes.item}
      >
        Upload
      </Button>
    </Grid>
  );
};
