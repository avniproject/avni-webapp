import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography
} from "@material-ui/core";
import _ from "lodash";
import { CHANGE_TYPE } from "../adminApp/service/CompareMetadataService";
import { Link } from "react-router-dom";
import { JsonEditor } from "../formDesigner/components/JsonEditor";

export const FileDiff = ({ changeReports }) => {
  const renderFieldChange = (changeType, entity, change) => {
    return (
      <Accordion>
        <AccordionSummary>
          <div style={{ color: getColor(changeType), marginLeft: 20 }}>{entity}</div>
        </AccordionSummary>
        <AccordionDetails>
          {_.isObject(change) ? <JsonEditor value={JSON.stringify(change, null, 2)} readOnly={true} /> : change}
        </AccordionDetails>
      </Accordion>
    );
  };
  const renderFieldChanges = fieldChanges => {
    return _.map(fieldChanges, change => {
      const oldValue = !_.isNil(change.primitiveValueChange)
        ? change.primitiveValueChange.oldValue
        : !_.isNil(change.objectChangeReport)
        ? change.objectChangeReport.oldValue
        : _.map(change.collectionChangeReport, collReportItem => collReportItem.oldValue);
      const newValue = !_.isNil(change.primitiveValueChange)
        ? change.primitiveValueChange.newValue
        : !_.isNil(change.objectChangeReport)
        ? change.objectChangeReport.newValue || renderFieldChanges(change.objectChangeReport.fieldChanges)
        : _.map(
            change.collectionChangeReport,
            collReportItem => collReportItem.newValue || renderFieldChanges(collReportItem.fieldChanges)
          );
      const changeDetail = {};
      changeDetail.fieldName = change.fieldName;
      if (change.changeType === CHANGE_TYPE.MISSING) {
        changeDetail.change = "Missing";
      } else {
        changeDetail.change = !_.isNil(oldValue) ? oldValue + " -> " + newValue : newValue;
      }
      return changeDetail;
    });
  };
  return _.map(changeReports, cr => {
    const changedEntity = cr.oldValue || cr.newValue;
    const entityName = changedEntity ? changedEntity.name || changedEntity.uuid : cr.uuid;
    let entity = `${cr.changeType} ${entityName}`;
    let change = null;
    switch (cr.changeType) {
      case CHANGE_TYPE.ADDED:
        change = cr.newValue;
        break;
      case CHANGE_TYPE.MODIFIED:
        change = !_.isNil(cr.newValue) ? cr.newValue : renderFieldChanges(cr.fieldChanges);
        break;
      case CHANGE_TYPE.VOIDED:
        change = cr.newValue || renderFieldChanges(cr.fieldChanges);
        break;
      case CHANGE_TYPE.MISSING:
        change = cr.oldValue;
        break;
      default:
        change = null;
    }
    return !_.isNil(change) ? renderFieldChange(cr.changeType, entity, change) : null;
  });
};

const getColor = function(changeType) {
  switch (changeType) {
    case CHANGE_TYPE.ADDED:
      return "green";
    case CHANGE_TYPE.MISSING:
      return "gray";
    case CHANGE_TYPE.MODIFIED:
      return "orange";
    case CHANGE_TYPE.VOIDED:
      return "red";
    default:
      return "black";
  }
};

const getChangeSummaryForFile = (fileName, changeReports) => {
  const countsByChangeType = _.countBy(changeReports, cr => cr.changeType);
  const summary = _.map(countsByChangeType, (value, key) => `${value} ${key}`).join(", ");
  return `${fileName} - ${summary}`;
};

const MetadataDiff = ({ response, error, loading, endReview }) => {
  const [selectedForm, setSelectedForm] = useState("");

  const handleFormChange = event => {
    const selectedKey = event.target.value;
    setSelectedForm(selectedKey);
  };

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
          <Link onClick={endReview}>{"Back to Upload"}</Link>
          <br />
          <br />
          {response && (!_.isNil(response.fileChangeReports) || !_.isNil(response.missingFilesInExisting)) ? (
            <>
              <FormControl variant="outlined" fullWidth style={{ marginTop: 20 }}>
                <InputLabel>Select Form or Missing Files</InputLabel>
                <Select value={selectedForm} onChange={handleFormChange} label="Select Form or Missing Files">
                  {!_.isNil(response.fileChangeReports) &&
                    Object.entries(response.fileChangeReports).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {getChangeSummaryForFile(key, value.changeReports)}
                      </MenuItem>
                    ))}
                  {!_.isNil(response.missingFilesInExisting) &&
                    Object.entries(response.missingFilesInExisting).map(([key, value]) => (
                      <MenuItem disabled key={key} value={value}>
                        {`${value} - New`}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              {selectedForm && response.fileChangeReports[selectedForm] && (
                <div style={{ marginTop: 20 }}>
                  {/*<JsonWithColor data={response.fileChangeReports[selectedForm].changeReports}/>*/}
                  <FileDiff changeReports={response.fileChangeReports[selectedForm].changeReports} />
                </div>
              )}
            </>
          ) : (
            !loading && (
              <Typography variant="h5" gutterBottom>
                No Changes
              </Typography>
            )
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MetadataDiff;
