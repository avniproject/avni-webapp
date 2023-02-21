import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { filter, get, isEmpty, isNil, concat } from "lodash";
import Status from "./Status";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import CloudDownload from "@material-ui/icons/CloudDownload";
import Button from "@material-ui/core/Button";
import FileUpload from "../common/components/FileUpload";
import Types from "./Types";
import api from "./api";
import DropDown from "../common/components/DropDown";
import { getStatuses, getUploadTypes } from "./reducers";
import UploadTypes from "./UploadTypes";
import { Title } from "react-admin";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { LocationModes } from "./LocationModes";
import { ROLES } from "../common/constants";

const useStyles = makeStyles(theme => ({
  root: {},
  button: {
    color: "#3f51b5"
  },
  uploadDownloadSection: {
    padding: theme.spacing(2)
  }
}));

const Dashboard = ({ getStatuses, getUploadTypes, uploadTypes = new UploadTypes(), userRoles }) => {
  const classes = useStyles();
  const [uploadType, setUploadType] = React.useState("");
  const [entityForDownload, setEntityForDownload] = React.useState("");
  const [file, setFile] = React.useState();
  const [autoApprove, setAutoApprove] = React.useState(false);
  const [mode, setMode] = React.useState("relaxed");

  const selectFile = (content, userfile) => setFile(userfile);
  const getUploadTypeCode = name => Types.getCode(name) || uploadTypes.getCode(name);

  const uploadFile = async () => {
    const [ok, error] = await api.bulkUpload(
      getUploadTypeCode(uploadType),
      file,
      autoApprove,
      mode
    );
    if (!ok && error) {
      alert(error);
    }
    setFile();
    setUploadType("");
    setTimeout(() => {
      getStatuses(0);
    }, 1000);
  };

  const downloadSampleFile = async () => {
    if (Types.getCode(entityForDownload)) {
      await api.downloadSample(Types.getCode(entityForDownload));
    } else if (uploadTypes.getCode(entityForDownload)) {
      await api.downloadDynamicSample(uploadTypes.getCode(entityForDownload));
    }
    setEntityForDownload("");
  };

  React.useEffect(() => {
    getUploadTypes();
  }, []);

  const isAdmin = userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.ORG_ADMIN);

  const uploadOptions = () =>
    isAdmin ? concat(Types.names, uploadTypes.names) : uploadTypes.names;

  const downloadOptions = () =>
    filter(uploadOptions(), ({ name }) => name !== Types.getName("metadataZip"));

  const dropdownHandler = option => {
    setAutoApprove(false);
    setMode("relaxed");
    setUploadType(option);
  };

  return (
    <Grid container spacing={2} className={classes.root}>
      <Title title={"Upload"} />
      <Grid item xs={12} style={{ minWidth: 1200, maxWidth: 1400 }}>
        <Paper className={classes.uploadDownloadSection}>
          <DocumentationContainer filename={"Upload.md"}>
            <Grid container>
              <Grid item xs={12} sm={6}>
                <Grid container item>
                  Upload
                </Grid>
                <Grid container item spacing={2}>
                  <Grid container item xs={12} sm={3}>
                    <DropDown
                      name="Type"
                      value={uploadType}
                      onChange={dropdownHandler}
                      options={uploadOptions()}
                    />
                  </Grid>
                  <Grid
                    container
                    item
                    direction="column"
                    justify="center"
                    alignItems="flex-start"
                    xs={12}
                    sm={9}
                    spacing={2}
                  >
                    <Grid item>
                      <FileUpload
                        canSelect={!isEmpty(uploadType)}
                        canUpload={!isNil(file)}
                        onSelect={selectFile}
                        onUpload={uploadFile}
                      />
                    </Grid>
                    <Grid item>Selected File: {get(file, "name", "")}</Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container item>
                  Download Sample
                </Grid>
                <Grid item container direction="row" justify="flex-start" alignItems="center">
                  <DropDown
                    name="Type"
                    value={entityForDownload}
                    onChange={setEntityForDownload}
                    options={downloadOptions()}
                  />
                  <Button
                    color="primary"
                    onClick={downloadSampleFile}
                    disabled={isEmpty(entityForDownload)}
                  >
                    <CloudDownload disabled={isEmpty(entityForDownload)} />
                    {" Download"}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
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
            {uploadType === "Locations" && <LocationModes mode={mode} setMode={setMode} />}
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
  userRoles: state.app.user.roles
});

export default withRouter(
  connect(
    mapStateToProps,
    { getUploadTypes, getStatuses }
  )(Dashboard)
);
