import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { get, isEmpty, isNil } from "lodash";
import Status from "./Status";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import FileUpload from "../common/components/FileUpload";
import Types from "./Types";
import api from "./api";
import DropDown from "../common/components/DropDown";

const useStyles = makeStyles(theme => ({
  root: {},
  button: {
    color: "#3f51b5"
  },
  uploadbox: {
    padding: theme.spacing(2)
  }
}));

const Dashboard = () => {
  const classes = useStyles();
  const [entity, setEntity] = React.useState("");
  const [file, setFile] = React.useState();

  const selectFile = (content, userfile) => setFile(userfile);

  const uploadFile = async () => {
    await api.bulkUpload(Types.getCode(entity), file).then(() => setFile());
    setEntity("");
  };

  return (
    <Paper className={classes.root}>
      <Box paddingX={4} paddingTop={2} paddingBottom={4}>
        <Paper className={classes.uploadbox}>
          <Grid container item>
            Upload
          </Grid>
          <Grid container item>
            <Grid container item xs={12} sm={3}>
              <DropDown name="Type" value={entity} onChange={setEntity} options={Types.names} />
            </Grid>
            <Grid container item direction="column" justify="flex-start" xs={12} sm={3}>
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
        </Paper>
      </Box>
      <Status />
    </Paper>
  );
};

export default withRouter(
  connect(
    state => ({}),
    {}
  )(Dashboard)
);
