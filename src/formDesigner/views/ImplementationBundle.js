import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import JSZip from "jszip";
import http from "common/utils/httpClient";
import { LineBreak } from "../../common/components/utils";
import fileDownload from "js-file-download";
import { connect } from "react-redux";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";

function ImplementationBundle({ organisation }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = React.useState(false);
  const showUploadFeature = false; //Feature toggle to hide upload function
  const [includeLocations, setIncludeLocations] = React.useState(false);

  const onFileSelected = event => {
    setSelectedFile(event.target.files[0]);
  };

  function post(url, jsonText) {
    return http.post(url, jsonText, {
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
    http
      .get(`/implementation/export/${includeLocations}`, {
        responseType: "blob"
      })
      .then(response => {
        fileDownload(response.data, `${organisation.name}.zip`);
      });
  }

  return (
    <Box boxShadow={2} p={3} bgcolor="background.paper">
      <DocumentationContainer filename={"Bundle.md"}>
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
        <FormControlLabel
          control={
            <Checkbox
              checked={includeLocations}
              onChange={event => setIncludeLocations(event.target.checked)}
              name="location"
            />
          }
          label="Include Locations"
        />
        <p />
        <Button variant="contained" color="primary" onClick={onDownloadHandler}>
          Download
        </Button>
      </DocumentationContainer>
    </Box>
  );
}

const mapStateToProps = state => ({
  organisation: state.app.organisation
});

export default connect(
  mapStateToProps,
  null
)(ImplementationBundle);
