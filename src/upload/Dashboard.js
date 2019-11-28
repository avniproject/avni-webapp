import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { get, isEmpty, isNil } from "lodash";
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

const useStyles = makeStyles(theme => ({
  root: {},
  button: {
    color: "#3f51b5"
  },
  uploadDownloadSection: {
    padding: theme.spacing(2)
  }
}));

const Dashboard = () => {
  const classes = useStyles();
  const [entity, setEntity] = React.useState("");
  const [entityForDownload, setEntityForDownload] = React.useState("");
  const [file, setFile] = React.useState();

  const selectFile = (content, userfile) => setFile(userfile);

  const uploadFile = async () => {
    const [ok, error] = await api.bulkUpload(Types.getCode(entity), file);
    if (!ok && error) {
      alert(error);
    }
    setFile();
    setEntity("");
  };

  const downloadSampleFile = async () => {
    await api.downloadSample(Types.getCode(entityForDownload));
    setEntityForDownload("");
  };

  return (
    <Grid container spacing={2} className={classes.root}>
      <Grid item style={{ minWidth: 1200, maxWidth: 1400 }}>
        <Paper className={classes.uploadDownloadSection}>
          <Grid container>
            <Grid item xs={12} sm={6}>
              <Grid container item>
                Upload
              </Grid>
              <Grid container item spacing={2}>
                <Grid container item xs={12} sm={3}>
                  <DropDown name="Type" value={entity} onChange={setEntity} options={Types.names} />
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
                      canSelect={!isEmpty(entity)}
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
                  options={Types.names}
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
        </Paper>
      </Grid>
      <Grid item>
        <Paper>
          <Status />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default withRouter(
  connect(
    state => ({}),
    {}
  )(Dashboard)
);
