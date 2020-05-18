import { connect } from "react-redux";
import React from "react";
import { withRouter } from "react-router-dom";
import { getGroups } from "./reducers";
import { Input, InputLabel, makeStyles } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import { map } from "lodash";
import { GroupCard } from "./components/GroupCard";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Modal from "@material-ui/core/Modal";
import FormControl from "@material-ui/core/FormControl";
import api from "./api";
import { Title } from "react-admin";
import { DocumentationContainer } from "../common/components/DocumentationContainer";

const useStyles = makeStyles(theme => ({
  root: {},
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  }
}));

const UserGroups = ({ getGroups, groups, ...props }) => {
  const classes = useStyles();

  React.useEffect(() => {
    getGroups();
  }, []);

  const [openModal, setOpenModal] = React.useState(false);
  const [groupName, setGroupName] = React.useState("");
  const [groupNameError, setGroupNameError] = React.useState(false);

  const groupCreationHandler = async () => {
    if (!groupName.trim().length > 0) {
      setGroupNameError(true);
      return;
    }
    const [ok, error] = await api.createGroups(groupName.trim());
    if (!ok && error) {
      alert(error);
    }
    setTimeout(() => getGroups(), 1000);
    setGroupName("");
    setOpenModal(false);
  };

  return (
    <Box boxShadow={2} p={3} bgcolor="background.paper">
      <DocumentationContainer filename={"UserGroup.md"}>
        <Title title={"User Groups"} />
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={openModal}
          onClose={() => setOpenModal(false)}
        >
          <div className={classes.paper} style={{ top: "30%", left: "40%" }}>
            <h4 id="group-title">Create a new Group</h4>
            <Grid container item>
              <FormControl>
                <InputLabel error={groupNameError}>Group name</InputLabel>
                <Input
                  error={groupNameError}
                  value={groupName}
                  onChange={event => {
                    setGroupName(event.target.value);
                    setGroupNameError(false);
                  }}
                />
              </FormControl>
            </Grid>
            <Box mt={3}>
              <Button
                mt={10}
                variant="contained"
                color="primary"
                onClick={() => groupCreationHandler()}
              >
                {"Create New Group"}
              </Button>
            </Box>
          </div>
        </Modal>
        <Grid container justify="flex-start">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenModal(true)}
            style={{ marginLeft: 20 }}
          >
            {"Create Group"}
          </Button>
        </Grid>

        <Grid container>
          {map(groups, (group, index) => (
            <GroupCard
              key={index}
              groupName={group.name}
              hasAllPrivileges={group.hasAllPrivileges}
              href={`userGroupDetails/${group.id}`}
            />
          ))}
        </Grid>
      </DocumentationContainer>
    </Box>
  );
};

const mapStateToProps = state => ({
  groups: state.userGroups.groups
});

export default withRouter(
  connect(
    mapStateToProps,
    { getGroups }
  )(UserGroups)
);
