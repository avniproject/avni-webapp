import React, { useState } from "react";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import Button from "@material-ui/core/Button";
import JSZip from "jszip";
// import axios from "axios";

function UploadImpl() {
  const [selectedFile, setSelectedFile] = useState(null);

  const onFileSelected = event => {
    setSelectedFile(event.target.files[0]);
  };

  const onUploadHandler = () => {
    JSZip.loadAsync(selectedFile).then(zip => {
      zip.forEach((relativePath, zipEntry) => {
        zip.files[relativePath].async("text").then(data => {
          if (!zipEntry.dir) {
            if (relativePath.startsWith("concepts")) {
              // console.log(`CONCEPTS ${relativePath}: ${data}`);
              // axios.post("/concepts", data, {
              //   headers: {
              //     "Content-Type": "application/json"
              //   }
              // });
            } else if (relativePath.startsWith("forms")) {
              // axios.post("/forms", data, {
              //   headers: {
              //     "Content-Type": "application/json"
              //   }
              // });
            }
          }
        });
      });
    });
  };

  return (
    <ScreenWithAppBar appbarTitle={`Import Export`}>
      <p>Upload Implementation</p>
      <div
        style={{
          display: "flex",
          alignItems: "center"
        }}
      >
        <input type="file" onChange={onFileSelected} />
        <Button variant="contained" color="primary" onClick={onUploadHandler}>
          Upload
        </Button>
      </div>
      <p />
    </ScreenWithAppBar>
  );
}

export default UploadImpl;
