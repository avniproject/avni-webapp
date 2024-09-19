import React, { useState } from "react";
import { Button, Typography, Paper, Grid, CircularProgress, MenuItem, FormControl, Select, InputLabel } from "@material-ui/core";
import httpClient from "common/utils/httpClient";

const MetadataDiff = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState("");

  const formLabels = {
    "Missing Files in PROD ZIP": "Removed from Old Metadata",
    "Missing Files in UAT ZIP": "Newly Added Metadata"
  };

  const getDisplayLabel = formKey => formLabels[formKey] || formKey;
  const isValueChanged = value => value && typeof value === "object" && value.oldValue !== undefined && value.newValue !== undefined;

  const handleFileChange = (event, fileNumber) => {
    const file = event.target.files[0];
    if (fileNumber === 1) {
      setFile1(file);
    } else if (fileNumber === 2) {
      setFile2(file);
    }
  };

  const isNoModification = obj => {
    if (typeof obj !== "object" || obj === null) return false;
    if (obj.changeType === "noModification") return true;
    return Object.values(obj).some(value => isNoModification(value));
  };

  const shouldIncludeForm = formName => {
    return formName !== "SomeExcludedFormName";
  };

  const filterForms = data => {
    const filteredData = Object.keys(data).reduce((acc, formName) => {
      const formData = data[formName];
      if (!isNoModification(formData) && formName !== "formMappings.json") {
        acc[formName] = formData;
      }
      return acc;
    }, {});

    return Object.keys(filteredData).reduce((acc, formName) => {
      if (shouldIncludeForm(formName)) {
        acc[formName] = filteredData[formName];
      }
      return acc;
    }, {});
  };

  const handleSubmit = async () => {
    if (!file1 || !file2) {
      setError("Please select both files.");
      return;
    }

    const formData = new FormData();
    formData.append("file1", file1);
    formData.append("file2", file2);

    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const response = await httpClient.post("/api/compare-metadata", formData);
      const filteredData = filterForms(response.data);
      setResponse(filteredData);
      setSelectedForm("");
    } catch (err) {
      setError("An error occurred while comparing metadata.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = event => {
    const selectedKey = event.target.value;
    setSelectedForm(selectedKey);
  };

  const getColor = changeType => {
    switch (changeType) {
      case "added":
        return "green";
      case "removed":
        return "red";
      case "modified":
        return "orange";
      default:
        return "black";
    }
  };

  const renderJsonWithColor = (data, indent = 0, parentChangeType = null) => {
    if (typeof data !== "object" || data === null) {
      return <span style={{ fontSize: "18px" }}>{String(data)}</span>;
    }

    return (
      <div style={{ marginLeft: indent, fontSize: "18px" }}>
        {Object.keys(data).map(key => {
          const value = data[key];
          const changeType = value && typeof value === "object" && value.changeType ? value.changeType : parentChangeType;

          if (key === "changeType" || key === "dataType") return null;

          if (isValueChanged(value)) {
            return renderChangedValue(key, value, indent);
          }

          if (Array.isArray(value)) {
            return renderArray(key, value, indent, changeType);
          }

          if (typeof value === "object") {
            return renderNestedObject(key, value, indent, changeType);
          }

          return renderKeyValue(key, value, changeType);
        })}
      </div>
    );
  };

  const renderChangedValue = (key, value, indent) => (
    <div key={key} style={{ marginBottom: 10 }}>
      <strong style={{ color: "orange", fontSize: "18px" }}>{key}:</strong>
      <div style={{ color: getColor("removed"), marginLeft: 20 }}>
        <strong>oldValue:</strong> {renderJsonWithColor(value.oldValue, indent + 20, "removed")}
      </div>
      <div style={{ color: getColor("added"), marginLeft: 20 }}>
        <strong>newValue:</strong> {renderJsonWithColor(value.newValue, indent + 20, "added")}
      </div>
    </div>
  );

  const renderArray = (key, array, indent, changeType) => (
    <div key={key} style={{ marginBottom: 20 }}>
      <strong style={{ color: getColor(changeType), fontSize: "18px" }}>{key}:</strong>
      {array.map((item, index) => (
        <div key={index} style={{ marginLeft: 20 }}>
          {renderJsonWithColor(item, indent + 20, item.changeType || changeType)}
        </div>
      ))}
    </div>
  );

  const renderNestedObject = (key, obj, indent, changeType) => (
    <div key={key} style={{ marginBottom: 10 }}>
      <strong style={{ color: getColor(changeType), fontSize: "18px" }}>{key}:</strong>
      <div style={{ marginLeft: 20 }}>{renderJsonWithColor(obj, indent + 20, obj.changeType || changeType)}</div>
    </div>
  );

  const renderKeyValue = (key, value, changeType) => (
    <div key={key} style={{ marginBottom: 20 }}>
      <strong style={{ color: getColor(changeType), fontSize: "18px" }}>{key}:</strong>
      <div style={{ color: getColor(changeType), marginLeft: 20 }}>{String(value)}</div>
    </div>
  );

  return (
    <Paper style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h4" gutterBottom>
          Metadata Diff
        </Typography>
      </div>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} style={{ display: "flex", justifyContent: "flex-start" }}>
          <input
            accept=".zip"
            type="file"
            onChange={e => handleFileChange(e, 1)}
            style={{
              display: "block",
              marginBottom: 50,
              width: "150%",
              padding: "20px",
              fontSize: "20px",
              cursor: "pointer"
            }}
          />
        </Grid>
        <Grid item xs={12} md={6} style={{ display: "flex", justifyContent: "center" }}>
          <input
            accept=".zip"
            type="file"
            onChange={e => handleFileChange(e, 2)}
            style={{
              display: "block",
              marginBottom: 50,
              width: "150%",
              padding: "20px",
              fontSize: "20px",
              cursor: "pointer",
              transform: "translateX(-70%)"
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: "-80px", marginLeft: "20px", fontSize: "18px" }}
          >
            Compare Metadata
          </Button>
        </Grid>
        <Grid item xs={12}>
          {loading && <CircularProgress />}
          {error && <Typography color="error">{error}</Typography>}
          {response && (
            <>
              <FormControl variant="outlined" fullWidth style={{ marginTop: 20 }}>
                <InputLabel>Select Form or Missing Files</InputLabel>
                <Select value={selectedForm} onChange={handleFormChange} label="Select Form or Missing Files">
                  {response["Missing Files in PROD ZIP"] && response["Missing Files in PROD ZIP"].length > 0 && (
                    <MenuItem value="Missing Files in PROD ZIP">{getDisplayLabel("Missing Files in PROD ZIP")}</MenuItem>
                  )}
                  {response["Missing Files in UAT ZIP"] && response["Missing Files in UAT ZIP"].length > 0 && (
                    <MenuItem value="Missing Files in UAT ZIP">{getDisplayLabel("Missing Files in UAT ZIP")}</MenuItem>
                  )}
                  {Object.keys(response)
                    .filter(key => !["Missing Files in PROD ZIP", "Missing Files in UAT ZIP"].includes(key))
                    .map(key => (
                      <MenuItem key={key} value={key}>
                        {getDisplayLabel(key)}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              {selectedForm && response[selectedForm] && <div style={{ marginTop: 20 }}>{renderJsonWithColor(response[selectedForm])}</div>}
            </>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MetadataDiff;
