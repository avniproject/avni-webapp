import React, { useCallback, useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
// eslint-disable-next-line
import _, { concat, get, isEmpty, isNil } from "lodash";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import CloudDownload from "@material-ui/icons/CloudDownload";
import Button from "@material-ui/core/Button";
import FileUpload from "../common/components/FileUpload";
import { staticTypesWithDynamicDownload, staticTypesWithStaticDownload } from "./Types";
import api from "./api";
import DropDown from "../common/components/DropDown";
import { getStatuses, getUploadTypes } from "./reducers";
import UploadTypes from "./UploadTypes";
import { Title } from "react-admin";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { LocationModes } from "./LocationModes";
import EncounterModes, { ENCOUNTER_MODES } from "./EncounterModes";
import Tooltip from "@material-ui/core/Tooltip";
import { LocationHierarchy } from "./LocationHierarchy";
import Typography from "@material-ui/core/Typography";
import { Box } from "@material-ui/core";
import MetadataDiff from "./MetadataDiff";
import CompareMetadataService from "../adminApp/service/CompareMetadataService";
import httpClient from "../common/utils/httpClient";
import UploadStatus from "./UploadStatus";

const useStyles = makeStyles(theme => ({
  root: {},
  button: {
    color: "#3f51b5"
  },
  uploadDownloadSection: {
    padding: theme.spacing(2)
  },
  reviewButton: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    backgroundColor: "#2196F3",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#1976D2"
    }
  }
}));

const UPLOAD_TYPES = {
  LOCATIONS: "Locations"
};

const LOCATION_MODES = {
  CREATE: "CREATE"
};

const ENCOUNTER_PREFIXES = {
  ENCOUNTER: "Encounter---",
  PROGRAM_ENCOUNTER: "ProgramEncounter---"
};
class ReviewStatus {
  constructor(loading, response, error) {
    this.loading = loading;
    this.response = response;
    this.error = error;
  }
}

const isMetadataDiffReviewEnabled = true;

const uploadTypesThatRequireId = [
  "Child Test new update registration",
  "Pulse Polio enrolment",
  "Regular Assessment Encounter",
  "Updated type registration"
];

function getCSVHeaders(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target.result;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
      resolve(headers);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

const UploadDashboard = ({ getStatuses, getUploadTypes, uploadTypes = new UploadTypes(), userRoles }) => {
  const classes = useStyles();

  const [uploadType, setUploadType] = useState("");
  const [entityForDownload, setEntityForDownload] = useState("");
  const [file, setFile] = useState(null);
  const [autoApprove, setAutoApprove] = useState(false);
  const [locationUploadMode, setLocationUploadMode] = useState("");
  const [encounterUploadMode, setEncounterUploadMode] = useState("");
  const [hierarchy, setHierarchy] = useState(null);
  const [configuredHierarchies, setConfiguredHierarchies] = useState([]);
  const [reviewStatus, setReviewStatus] = useState(null);

  const getUploadTypeCode = useCallback(
    name => staticTypesWithStaticDownload.getCode(name) || staticTypesWithDynamicDownload.getCode(name) || uploadTypes.getCode(name),
    [uploadTypes]
  );

  const isEncounterType = useCallback(
    type => {
      const internalUploadType = getUploadTypeCode(type);
      return (
        internalUploadType &&
        (internalUploadType.startsWith(ENCOUNTER_PREFIXES.ENCOUNTER) || internalUploadType.startsWith(ENCOUNTER_PREFIXES.PROGRAM_ENCOUNTER))
      );
    },
    [getUploadTypeCode]
  );

  const uploadAndDownloadOptions = useMemo(
    () => concat(staticTypesWithStaticDownload.names, staticTypesWithDynamicDownload.names, _.sortBy(uploadTypes.names, x => x.name)),
    [uploadTypes.names]
  );

  const handleFileSelect = useCallback((content, userFile) => {
    setFile(userFile);
  }, []);

  const handleDropdownChange = useCallback(
    option => {
      setAutoApprove(false);
      setLocationUploadMode(option === UPLOAD_TYPES.LOCATIONS ? LOCATION_MODES.CREATE : "");
      setEncounterUploadMode(isEncounterType(option) ? ENCOUNTER_MODES.SCHEDULE : "");
      setUploadType(option);
      if (option !== staticTypesWithStaticDownload.getName("metadataZip")) {
        setEntityForDownload(option);
      }
    },
    [isEncounterType]
  );

  const handleUploadFile = useCallback(async () => {
    try {
      if (uploadTypesThatRequireId.includes(uploadType)) {
        const headers = await getCSVHeaders(file);
        const requiredColumn = "Id from previous system";
        if (!headers.includes(requiredColumn)) {
          alert(`The uploaded file must contain the "${requiredColumn}" column to prevent duplication.`);
          return;
        }
      }

      const locationUploadModeValue = uploadType === UPLOAD_TYPES.LOCATIONS ? locationUploadMode : "";
      const encounterUploadModeValue = isEncounterType(uploadType) ? encounterUploadMode : "";
      const [ok, error] = await api.bulkUpload(
        getUploadTypeCode(uploadType),
        file,
        autoApprove,
        locationUploadModeValue,
        hierarchy || 0,
        encounterUploadModeValue
      );
      if (!ok && error) {
        if (error === "Double extension file detected") {
          alert(`Please rename ${file.name} to have a single extension and try again.`);
        } else {
          alert(`Upload failed: ${error}`);
        }
        return;
      }

      setFile(null);
      setUploadType("");
      setEntityForDownload("");
      setLocationUploadMode("");
      setEncounterUploadMode("");
      setHierarchy(null);
      setTimeout(() => getStatuses(0), 1000);
    } catch (err) {
      alert(`Upload error: ${err.message || "Unknown error"}`);
    }
  }, [file, uploadType, autoApprove, locationUploadMode, hierarchy, getUploadTypeCode, getStatuses, encounterUploadMode]);

  const downloadStaticSample = useCallback(async code => {
    await api.downloadSample(code);
  }, []);

  const downloadLocationSample = useCallback(async (code, mode, hierarchy) => {
    await api.downloadLocationsSample(code, mode, hierarchy);
  }, []);

  const downloadEncounterSample = useCallback(async (code, mode) => {
    await api.downloadEncounterSample(code, mode);
  }, []);

  const downloadDynamicSample = useCallback(async code => {
    await api.downloadDynamicSample(code);
  }, []);

  const handleDownloadSample = useCallback(async () => {
    try {
      const code = getUploadTypeCode(entityForDownload);

      if (staticTypesWithStaticDownload.getCode(entityForDownload)) {
        await downloadStaticSample(code);
      } else if (code === "locations") {
        if (isEmpty(locationUploadMode) || (locationUploadMode === LOCATION_MODES.CREATE && isEmpty(hierarchy))) {
          alert("Please select a valid locationUploadMode and hierarchy for location sample.");
          return;
        }
        await downloadLocationSample(code, locationUploadMode, hierarchy);
      } else if (isEncounterType(entityForDownload)) {
        if (isEmpty(encounterUploadMode)) {
          alert("Please select an encounter mode.");
          return;
        }
        await downloadEncounterSample(code, encounterUploadMode);
      } else {
        const response = await httpClient.getData(`/web/importSampleDownloadable?uploadType=${code}`);
        if (response.success) await api.downloadDynamicSample(code);
        else alert(`Failed to download sample: ${response.message}`);
      }
    } catch (error) {
      alert(`Failed to download sample: ${error.message || "Unknown error"}`);
    }
  }, [
    entityForDownload,
    locationUploadMode,
    encounterUploadMode,
    hierarchy,
    getUploadTypeCode,
    isEncounterType,
    downloadStaticSample,
    downloadLocationSample,
    downloadEncounterSample,
    downloadDynamicSample
  ]);

  const handleError = err => {
    setReviewStatus(new ReviewStatus(false, null, "An error occurred while comparing metadata."));
    console.error("Review error:", err);
  };
  const handleReviewClick = useCallback(async () => {
    setReviewStatus(new ReviewStatus(true, null, null));
    try {
      const filteredData = await CompareMetadataService.compare(file);
      if (!_.isNil(filteredData.errors)) handleError(filteredData.errors);
      else setReviewStatus(new ReviewStatus(false, filteredData, null));
    } catch (err) {
      handleError(err);
    }
  }, [file]);

  const isSampleDownloadDisallowed = useMemo(
    () =>
      isEmpty(entityForDownload) ||
      (uploadType === UPLOAD_TYPES.LOCATIONS && isEmpty(locationUploadMode)) ||
      (uploadType === UPLOAD_TYPES.LOCATIONS && locationUploadMode === LOCATION_MODES.CREATE && isEmpty(hierarchy)) ||
      (isEncounterType(uploadType) && isEmpty(encounterUploadMode)),
    [entityForDownload, uploadType, locationUploadMode, hierarchy, isEncounterType, encounterUploadMode]
  );

  useEffect(() => {
    getUploadTypes();
    api.fetchLocationHierarchies().then(locHierarchies => {
      const firstHierarchy = get(locHierarchies, "[0].value", null);
      setHierarchy(firstHierarchy);
      setConfiguredHierarchies(locHierarchies);
    });
  }, [getUploadTypes]);

  console.log("file:", file);

  if (reviewStatus) {
    return (
      <MetadataDiff
        loading={reviewStatus.loading}
        response={reviewStatus.response}
        error={reviewStatus.error}
        endReview={() => setReviewStatus(null)}
      />
    );
  }

  return (
    <Grid container spacing={2} className={classes.root}>
      <Title title="Upload" />
      <Grid item xs={12} style={{ minWidth: 1200, maxWidth: 1400 }}>
        <Paper className={classes.uploadDownloadSection}>
          <DocumentationContainer filename="Upload.md">
            <Grid container item spacing={2}>
              <Grid container item>
                Upload
              </Grid>
              <Grid container item>
                <Grid container item direction="column" justifyContent="center" alignItems="flex-start" xs={8} sm={4} spacing={2}>
                  <DropDown name="Type" value={uploadType} onChange={handleDropdownChange} options={uploadAndDownloadOptions} />
                  <Tooltip title="Download Sample file for selected Upload type" placement="bottom-start" arrow>
                    <span>
                      <Button color="primary" onClick={handleDownloadSample} disabled={isSampleDownloadDisallowed}>
                        <CloudDownload disabled={isSampleDownloadDisallowed} />
                        <span style={{ marginLeft: "1em" }}>Download Sample</span>
                      </Button>
                    </span>
                  </Tooltip>
                </Grid>
                {isMetadataDiffReviewEnabled && uploadType === staticTypesWithStaticDownload.getName("metadataZip") && file && (
                  <Grid item>
                    <Button className={classes.reviewButton} onClick={handleReviewClick}>
                      Review
                    </Button>
                  </Grid>
                )}
                <Grid container item direction="column" justifyContent="center" alignItems="flex-start" xs={8} sm={4} spacing={2}>
                  <Grid item>
                    <FileUpload
                      canSelect={!isEmpty(uploadType)}
                      canUpload={!isNil(file)}
                      onSelect={handleFileSelect}
                      onUpload={handleUploadFile}
                    />
                  </Grid>
                  <Grid item>
                    <span style={{ marginLeft: "1em" }}>Selected File: {get(file, "name", "")}</span>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid container>
              <Grid container item>
                {uploadTypes.isApprovalEnabled(uploadType) && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={autoApprove}
                        onChange={event => setAutoApprove(event.target.checked)}
                        name="autoApprove"
                        color="primary"
                      />
                    }
                    label="Approve automatically"
                  />
                )}
              </Grid>
              <Grid container item>
                {uploadType === UPLOAD_TYPES.LOCATIONS && <LocationModes mode={locationUploadMode} setMode={setLocationUploadMode} />}
                {isEncounterType(uploadType) && <EncounterModes mode={encounterUploadMode} setMode={setEncounterUploadMode} />}
              </Grid>
              <Grid container item>
                {uploadType === UPLOAD_TYPES.LOCATIONS &&
                  locationUploadMode === LOCATION_MODES.CREATE &&
                  (configuredHierarchies.length > 0 ? (
                    <LocationHierarchy hierarchy={hierarchy} setHierarchy={setHierarchy} configuredHierarchies={configuredHierarchies} />
                  ) : (
                    <Box>
                      <Typography color="error" display="block" gutterBottom>
                        Invalid or missing Location Hierarchy.
                      </Typography>
                    </Box>
                  ))}
              </Grid>
            </Grid>
          </DocumentationContainer>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper style={{ marginBottom: 100 }}>
          <UploadStatus />
        </Paper>
      </Grid>
    </Grid>
  );
};

const mapStateToProps = state => ({
  statuses: state.bulkUpload.statuses,
  uploadTypes: state.bulkUpload.uploadTypes,
  userRoles: state.app.authSession.roles
});

export default withRouter(
  connect(
    mapStateToProps,
    { getUploadTypes, getStatuses }
  )(UploadDashboard)
);
