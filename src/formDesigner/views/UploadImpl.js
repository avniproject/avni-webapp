import React, { useState } from "react";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import Button from "@material-ui/core/Button";
import JSZip from "jszip";
import axios from "axios";

function UploadImpl() {
  const [selectedFile, setSelectedFile] = useState(null);

  const onFileSelected = event => {
    setSelectedFile(event.target.files[0]);
  };
  function post(url, jsonText) {
    return axios.post(url, jsonText, {
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  function onUploadHandler() {
    JSZip.loadAsync(selectedFile).then(zip => {
      zip.files["concepts.json"]
        .async("text")
        .then(data => {
          return post("/concepts", data);
        })
        .then(() => {
          zip.forEach((relativePath, zipEntry) => {
            zip.files[relativePath].async("text").then(data => {
              if (!zipEntry.dir && relativePath.startsWith("forms")) return post("/forms", data);
            });
          });
        });
    });
  }

  return (
    <ScreenWithAppBar enableLeftMenuButton={true} appbarTitle={`Import Export`}>
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
