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

  const handleFileChange = (event, fileNumber) => {
    const file = event.target.files[0];
    if (fileNumber === 1) {
      setFile1(file);
    } else if (fileNumber === 2) {
      setFile2(file);
    }
  };

  const filterForms = data => {
    const filteredData = {};
    const hasNoModification = obj => {
      if (typeof obj !== "object" || obj === null) return false;

      if (obj.changeType === "noModification") {
        return true;
      }

      return Object.values(obj).some(value => hasNoModification(value));
    };

    Object.keys(data).forEach(formName => {
      const formData = data[formName];
      if (!hasNoModification(formData) && formName !== "formMapping.json") {
        filteredData[formName] = formData;
      }
    });

    const additionalFilters = formName => {
      return formName !== "SomeExcludedFormName";
    };

    const result = {};
    Object.keys(filteredData).forEach(formName => {
      if (additionalFilters(formName)) {
        result[formName] = filteredData[formName];
      }
    });

    return result;
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
    if (typeof data === "object" && data !== null) {
      return (
        <div style={{ marginLeft: indent, fontSize: "18px" }}>
          {Object.keys(data).map(key => {
            const value = data[key];
            const changeType = value && typeof value === "object" && value.changeType ? value.changeType : parentChangeType;

            if (key === "changeType" || key === "dataType") return null;

            if (Array.isArray(value)) {
              return (
                <div key={key} style={{ marginBottom: 20 }}>
                  <strong style={{ color: getColor(changeType), fontSize: "18px" }}>{key}:</strong>
                  {value.map((item, index) => (
                    <div key={index}>{renderJsonWithColor(item, indent + 20, changeType)}</div>
                  ))}
                </div>
              );
            }

            if (changeType === "modified") {
              return (
                <div key={key} style={{ marginBottom: 10 }}>
                  <strong style={{ color: "orange", fontSize: "18px" }}>{key}:</strong>
                  {value.oldValue !== undefined && (
                    <div style={{ color: "red", fontSize: "18px" }}>
                      <strong>oldValue:</strong> {String(value.oldValue)}
                    </div>
                  )}
                  {value.newValue !== undefined && (
                    <div style={{ color: "green", fontSize: "18px" }}>
                      <strong>newValue:</strong> {String(value.newValue)}
                    </div>
                  )}
                  {typeof value === "object" && value !== null && !value.oldValue && !value.newValue && (
                    <div>{renderJsonWithColor(value, indent + 20, changeType)}</div>
                  )}
                </div>
              );
            }

            const color = getColor(changeType);
            return (
              <div key={key} style={{ marginBottom: 20 }}>
                <strong style={{ color, fontSize: "18px" }}>{key}:</strong>
                {typeof value === "object" && value !== null ? (
                  <div>{renderJsonWithColor(value, indent + 20, changeType)}</div>
                ) : (
                  <div style={{ color }}>{String(value)}</div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return <span style={{ fontSize: "18px" }}>{String(data)}</span>;
  };

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
