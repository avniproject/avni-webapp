import React, { useState } from "react";
import { Button, Typography, Paper, Grid, CircularProgress, MenuItem, FormControl, Select, InputLabel } from "@material-ui/core";
import httpClient from "common/utils/httpClient";
import _ from "lodash";

const MetadataDiff = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState("");

  const CHANGE_TYPE = {
    ADDED: "added",
    REMOVED: "removed",
    MODIFIED: "modified",
    NO_MODIFICATION: "noModification"
  };

  const formLabels = {
    "Missing Files in PROD ZIP": "Removed from Old Metadata",
    "Missing Files in UAT ZIP": "Newly Added Metadata"
  };

  const getDisplayLabel = formKey => formLabels[formKey] || formKey;
  const isValueChanged = value => _.isObject(value) && !_.isNil(value.oldValue) && !_.isNil(value.newValue);

  const handleFileChange = (event, fileNumber) => {
    const file = event.target.files[0];
    if (fileNumber === 1) {
      setFile1(file);
    } else if (fileNumber === 2) {
      setFile2(file);
    }
  };

  const isNoModification = obj => {
    if (!_.isObject(obj)) return false;
    if (obj.changeType === CHANGE_TYPE.NO_MODIFICATION) return true;
    return _.some(obj, value => isNoModification(value));
  };

  const filterForms = data => {
    const filteredData = _.reduce(
      data,
      (acc, formData, formName) => {
        if (!isNoModification(formData) && formName !== "formMappings.json") {
          acc[formName] = formData;
        }
        return acc;
      },
      {}
    );

    return _.reduce(
      filteredData,
      (acc, formData, formName) => {
        acc[formName] = formData;
        return acc;
      },
      {}
    );
  };

  const handleSubmit = async () => {
    if (_.isNil(file1) || _.isNil(file2)) {
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
      case CHANGE_TYPE.ADDED:
        return "green";
      case CHANGE_TYPE.REMOVED:
        return "red";
      case CHANGE_TYPE.MODIFIED:
        return "orange";
      default:
        return "black";
    }
  };

  const renderJsonWithColor = (data, indent = 0, parentChangeType = null) => {
    if (!_.isObject(data)) {
      return <span style={{ fontSize: "18px" }}>{String(data)}</span>;
    }

    return (
      <div style={{ marginLeft: indent, fontSize: "18px" }}>
        {_.map(data, (value, key) => {
          const changeType = _.isObject(value) && value.changeType ? value.changeType : parentChangeType;

          if (key === "changeType" || key === "dataType") return null;

          if (isValueChanged(value)) {
            return renderChangedValue(key, value, indent);
          }

          if (_.isArray(value)) {
            return renderArray(key, value, indent, changeType);
          }

          if (_.isObject(value)) {
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
      <div style={{ color: getColor(CHANGE_TYPE.REMOVED), marginLeft: 20 }}>
        <strong>oldValue:</strong> {renderJsonWithColor(value.oldValue, indent + 20, CHANGE_TYPE.REMOVED)}
      </div>
      <div style={{ color: getColor(CHANGE_TYPE.ADDED), marginLeft: 20 }}>
        <strong>newValue:</strong> {renderJsonWithColor(value.newValue, indent + 20, CHANGE_TYPE.ADDED)}
      </div>
    </div>
  );

  const renderArray = (key, array, indent, changeType) => (
    <div key={key} style={{ marginBottom: 20 }}>
      <strong style={{ color: getColor(changeType), fontSize: "18px" }}>{key}:</strong>
      {_.map(array, (item, index) => (
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
                  {Object.entries(response).map(([key, value]) => {
                    const shouldDisplay =
                      key === "Missing Files in PROD ZIP" || key === "Missing Files in UAT ZIP"
                        ? value.length > 0
                        : !["Missing Files in PROD ZIP", "Missing Files in UAT ZIP"].includes(key);

                    return shouldDisplay ? (
                      <MenuItem key={key} value={key}>
                        {getDisplayLabel(key)}
                      </MenuItem>
                    ) : null;
                  })}
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
