import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import JSZip from "jszip";
import axios from "axios";
import { LineBreak } from "../../common/components/utils";
import fileDownload from "js-file-download";
import { connect } from "react-redux";

import { Title } from "react-admin";
// import { styled } from '@material-ui/core/styles';
// import { compose, spacing, palette } from '@material-ui/system';
// const Box = styled('div')(
//     compose(
//       spacing,
//       palette,
//     ),
// );
function UploadImpl({ organisation }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = React.useState(false);
  const showUploadFeature = false; //Feature toggle to hide upload function

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
    if (!selectedFile) {
      alert("Please select the file first");
      return;
    }
    setLoading(true);
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
        })
        .then(() => {
          setLoading(false);
        });
    });
  }

  function onDownloadHandler() {
    axios
      .get("/implementation/export", {
        responseType: "blob"
      })
      .then(response => {
        fileDownload(response.data, `${organisation.name}.zip`);
      });
  }

  return (
    <div boxShadow={2} p={3} bgcolor="background.paper">
      <Title title="Bundle" />
      {showUploadFeature && (
        <>
          <p>Upload Implementation Bundle</p>
          <div
            style={{
              display: "flex",
              alignItems: "center"
            }}
          >
            <input type="file" onChange={onFileSelected} />

            <Button
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={onUploadHandler}
            >
              Upload
            </Button>
            {loading && <CircularProgress size={24} />}
          </div>
          <LineBreak num={2} />
        </>
      )}
      <p>Download Implementation Bundle</p>
      <Button variant="contained" color="primary" onClick={onDownloadHandler}>
        Download
      </Button>
    </div>
  );
}

const mapStateToProps = state => ({
  organisation: state.app.organisation
});

export default connect(
  mapStateToProps,
  null
)(UploadImpl);
