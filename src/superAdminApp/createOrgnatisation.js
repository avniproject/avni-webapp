import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import React from "react";
import DescriptionIcon from "@material-ui/icons/Description";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import { makeStyles } from "@material-ui/core/styles";
import { default as UUID } from "uuid";
import { Box } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200
  }
}));

export const createOrganisation = () => {
  const classes = useStyles();
  //TODo : user info?
  const [orgContract, setOrgContract] = React.useState({
    uuid: UUID.v4()
  });

  const [errors, setErrors] = React.useState({});

  const handleNameChange = event => {
    setOrgContract({ ...orgContract, name: event.target.value });
  };

  const handleDbUserName = event => {
    setOrgContract({ ...orgContract, dbUserName: event.target.value });
  };

  const handleMediaDirectoryChange = event => {
    setOrgContract({ ...orgContract, mediaDirectory: event.target.value });
  };

  const handleOrgAdminName = event => {
    setOrgContract({ ...orgContract, orgAdminName: event.target.value });
  };

  const sideBarOptions = [{ href: "#/org", name: "Create Organisation", Icon: DescriptionIcon }];
  return (
    <ScreenWithAppBar
      appbarTitle={`Create Organisation`}
      enableLeftMenuButton={true}
      sidebarOptions={sideBarOptions}
    >
      <Grid container direction="column">
        <Grid item sm={12}>
          <FormControl>
            <InputLabel htmlFor="component-simple">Organisation Name</InputLabel>
            <Input
              id="component-simple"
              required
              value={orgContract.name}
              onChange={handleNameChange}
            />
          </FormControl>
        </Grid>
        <Grid item sm={12}>
          <FormControl>
            <InputLabel htmlFor="component-simple">DB User Name</InputLabel>
            <Input
              id="component-simple"
              required
              value={orgContract.dbUserName}
              onChange={handleDbUserName}
            />
          </FormControl>
        </Grid>
        <Grid item sm={12}>
          <FormControl>
            <InputLabel htmlFor="component-simple">Media Directory Name</InputLabel>
            <Input
              id="component-simple"
              required
              value={orgContract.mediaDirectory}
              onChange={handleMediaDirectoryChange}
            />
          </FormControl>
        </Grid>
        <Grid item sm={12}>
          <FormControl>
            <InputLabel htmlFor="component-simple">Organisation Admin Name</InputLabel>
            <Input
              id="component-simple"
              required
              value={orgContract.orgAdminName}
              onChange={handleOrgAdminName}
            />
          </FormControl>
        </Grid>
        <Grid>
          <Button
            type="button"
            color="primary"
            variant="contained"
            style={{ marginTop: 40 }}
            onClick={() => console.log("------")}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </ScreenWithAppBar>
  );
};
