import React from "react";
import { isEmpty } from "lodash";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";

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
    <React.Fragment>
      <Box pl={4} pr={2}>
        <Button variant="contained" component="label" disabled={!canSelect}>
          Choose File
          <input type="file" value={value} onChange={onSelectWrapper} style={{ display: "none" }} />
        </Button>
      </Box>
      <Box pl={2} pr={4}>
        <div className="box has-text-centered">
          <Button
            variant="contained"
            onClick={onUploadWrapper}
            color="primary"
            aria-haspopup="false"
            disabled={!canUpload || isEmpty(value)}
          >
            Upload
          </Button>
        </div>
      </Box>
    </React.Fragment>
  );
};
