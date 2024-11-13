import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import _, { concat, get, isEmpty, isNil } from "lodash";
import Status from "./Status";
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
import Tooltip from "@material-ui/core/Tooltip";
import { LocationHierarchy } from "./LocationHierarchy";
import Typography from "@material-ui/core/Typography";
import { Box } from "@material-ui/core";
import MetadataDiff from "./MetadataDiff";

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

const isMetadataDiffReviewEnabled = false;
const Dashboard = ({ getStatuses, getUploadTypes, uploadTypes = new UploadTypes(), userRoles }) => {
  const classes = useStyles();
  const [uploadType, setUploadType] = React.useState("");
  const [entityForDownload, setEntityForDownload] = React.useState("");
  const [file, setFile] = React.useState();
  const [autoApprove, setAutoApprove] = React.useState(false);
  const [mode, setMode] = React.useState("CREATE");
  const [hierarchy, setHierarchy] = React.useState();
  const [configuredHierarchies, setConfiguredHierarchies] = React.useState([]);
  const [reviewMode, setReviewMode] = React.useState(false);

  const selectFile = (content, userfile) => setFile(userfile);
  const getUploadTypeCode = name =>
    staticTypesWithStaticDownload.getCode(name) || staticTypesWithDynamicDownload.getCode(name) || uploadTypes.getCode(name);

  const uploadFile = async () => {
    const [ok, error] = await api.bulkUpload(getUploadTypeCode(uploadType), file, autoApprove, mode, hierarchy || 0);
    if (!ok && error) {
      if (error === "Double extension file detected") {
        alert("Please rename " + file.name + " to have a single extension and try again.");
      } else {
        alert(error);
      }
    }
    setFile();
    setUploadType("");
    setEntityForDownload("");
    setTimeout(() => {
      getStatuses(0);
    }, 1000);
  };

  const downloadSampleFile = async () => {
    let uploadType;
    if (staticTypesWithStaticDownload.getCode(entityForDownload)) {
      await api.downloadSample(staticTypesWithStaticDownload.getCode(entityForDownload));
    } else if (
      !_.isUndefined((uploadType = uploadTypes.getCode(entityForDownload) || staticTypesWithDynamicDownload.getCode(entityForDownload)))
    ) {
      if (uploadType === "locations") {
        await api.downloadLocationsSample(uploadType, mode, hierarchy);
      } else {
        await api.downloadDynamicSample(uploadType);
      }
    }
  };

  React.useEffect(() => {
    getUploadTypes();
    api.fetchLocationHierarchies().then(locHierarchies => {
      setHierarchy(get(locHierarchies[0], "value"));
      setConfiguredHierarchies(locHierarchies);
    });
  }, []);

  const uploadAndDownloadOptions = () =>
    concat(staticTypesWithStaticDownload.names, staticTypesWithDynamicDownload.names, uploadTypes.names);

  const dropdownHandler = option => {
    setAutoApprove(false);
    setMode("CREATE");
    setUploadType(option);
    option !== staticTypesWithStaticDownload.getName("metadataZip") && setEntityForDownload(option);
  };

  const isSampleDownloadDisallowed =
    isEmpty(entityForDownload) ||
    (uploadType === "Locations" && isEmpty(mode)) ||
    (uploadType === "Locations" && mode === "CREATE" && isEmpty(hierarchy));

  const handleReviewClick = () => {
    setReviewMode(true);
  };

  if (reviewMode) {
    return <MetadataDiff />;
  }

  return (
    <Grid container spacing={2} className={classes.root}>
      <Title title={"Upload"} />
      <Grid item xs={12} style={{ minWidth: 1200, maxWidth: 1400 }}>
        <Paper className={classes.uploadDownloadSection}>
          <DocumentationContainer filename={"Upload.md"}>
            <Grid container item spacing={2}>
              <Grid container item>
                Upload
              </Grid>
              <Grid container item>
                <Grid container item direction="column" justifyContent="center" alignItems="flex-start" xs={8} sm={4} spacing={2}>
                  <DropDown name="Type" value={uploadType} onChange={dropdownHandler} options={uploadAndDownloadOptions()} />
                  <Tooltip title="Download Sample file for selected Upload type" placement="bottom-start" arrow>
                    <Button color="primary" onClick={downloadSampleFile} disabled={isSampleDownloadDisallowed}>
                      <CloudDownload disabled={isSampleDownloadDisallowed} />
                      <span style={{ marginLeft: "1em" }}>Download Sample</span>
                    </Button>
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
                    <FileUpload canSelect={!isEmpty(uploadType)} canUpload={!isNil(file)} onSelect={selectFile} onUpload={uploadFile} />
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
                    label={"Approve automatically"}
                  />
                )}
              </Grid>
              <Grid container item>
                {uploadType === "Locations" && <LocationModes mode={mode} setMode={setMode} />}
              </Grid>
              <Grid container item>
                {uploadType === "Locations" &&
                  mode === "CREATE" &&
                  (configuredHierarchies && configuredHierarchies.length > 0 ? (
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
      <Grid item>
        <Paper style={{ marginBottom: 100 }}>
          <Status />
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
  )(Dashboard)
);
