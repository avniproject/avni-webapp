import React, { useState } from "react";
import { CircularProgress, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Typography } from "@material-ui/core";
import _ from "lodash";
import { CHANGE_TYPE } from "../adminApp/service/CompareMetadataService";

const MetadataDiff = ({ response, error, loading }) => {
  const [selectedForm, setSelectedForm] = useState("");

  const formLabels = {
    "Missing Files in PROD ZIP": "Removed from Old Metadata",
    "Missing Files in UAT ZIP": "Newly Added Metadata"
  };

  const getDisplayLabel = formKey => formLabels[formKey] || formKey;
  const isValueChanged = value => _.isObject(value) && !_.isNil(value.oldValue) && !_.isNil(value.newValue);

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

  const JsonWithColor = ({ data, indent = 0, parentChangeType = null }) => {
    if (!_.isObject(data)) {
      return <span style={{ fontSize: "18px" }}>{String(data)}</span>;
    }

    return (
      <div style={{ marginLeft: indent, fontSize: "18px" }}>
        {_.map(data, (value, key) => {
          const changeType = _.isObject(value) && value.changeType ? value.changeType : parentChangeType;

          if (key === "changeType" || key === "dataType") return null;

          if (isValueChanged(value)) {
            return <ChangedValue key={key} value={value} indent={indent} />;
          }

          if (_.isArray(value)) {
            return <Array key={key} array={value} indent={indent} changeType={changeType} />;
          }

          if (_.isObject(value)) {
            return <NestedObject key={key} obj={value} indent={indent} changeType={changeType} />;
          }

          return <KeyValue key={key} value={value} changeType={changeType} />;
        })}
      </div>
    );
  };

  const ChangedValue = ({ key, value, indent }) => (
    <div key={key} style={{ marginBottom: 10 }}>
      <strong style={{ color: "orange", fontSize: "18px" }}>{key}:</strong>
      <div style={{ color: getColor(CHANGE_TYPE.REMOVED), marginLeft: 20 }}>
        <strong>oldValue:</strong>
        <JsonWithColor item={value.oldValue} indent={indent + 20} changeType={CHANGE_TYPE.REMOVED} />
      </div>
      <div style={{ color: getColor(CHANGE_TYPE.ADDED), marginLeft: 20 }}>
        <strong>newValue:</strong>
        <JsonWithColor item={value.newValue} indent={indent + 20} changeType={CHANGE_TYPE.ADDED} />
      </div>
    </div>
  );

  const Array = ({ key, array, indent, changeType }) => (
    <div key={key} style={{ marginBottom: 20 }}>
      <strong style={{ color: getColor(changeType), fontSize: "18px" }}>{key}:</strong>
      {_.map(array, (item, index) => (
        <div key={index} style={{ marginLeft: 20 }}>
          <JsonWithColor item={item} indent={indent + 20} changeType={item.changeType || changeType} />
        </div>
      ))}
    </div>
  );

  const NestedObject = ({ key, obj, indent, changeType }) => (
    <div key={key} style={{ marginBottom: 10 }}>
      <strong style={{ color: getColor(changeType), fontSize: "18px" }}>{key}:</strong>
      <div style={{ marginLeft: 20 }}>
        <JsonWithColor item={obj} indent={indent + 20} changeType={obj.changeType || changeType} />
      </div>
    </div>
  );

  const KeyValue = ({ key, value, changeType }) => (
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
              {selectedForm && response[selectedForm] && (
                <div style={{ marginTop: 20 }}>
                  <JsonWithColor data={response[selectedForm]} />
                </div>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MetadataDiff;
