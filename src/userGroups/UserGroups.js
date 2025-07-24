import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { getGroups } from "./reducers";
import { Input, InputLabel, Grid, Box, styled } from "@mui/material";
import { map } from "lodash";
import { GroupCard } from "./components/GroupCard";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import FormControl from "@mui/material/FormControl";
import api from "./api";
import { Title } from "react-admin";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import { AvniAlert } from "../common/components/AvniAlert";
import GroupModel from "../common/model/GroupModel";

const StyledBox = styled(Box)(({ theme }) => ({
  boxShadow: theme.shadows[2],
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper
}));

const StyledModalPaper = styled("div")(({ theme }) => ({
  position: "absolute",
  width: 400,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  top: "30%",
  left: "40%"
}));

const StyledGrid = styled(Grid)({
  justifyContent: "flex-start"
});

const StyledCreateButton = styled(Button)({
  marginLeft: 20
});

const StyledModalButtonContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3)
}));

const UserGroups = () => {
  const dispatch = useDispatch();
  const groups = useSelector(state => state.userGroups.groups);

  useEffect(() => {
    dispatch(getGroups());
  }, [dispatch]);

  const [openModal, setOpenModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupNameError, setGroupNameError] = useState(false);

  const groupCreationHandler = async () => {
    if (!groupName.trim().length > 0) {
      setGroupNameError(true);
      return;
    }
    const [ok, error] = await api.createGroups(groupName.trim());
    if (!ok && error) {
      alert(error);
    }
    setTimeout(() => dispatch(getGroups()), 1000);
    setGroupName("");
    setOpenModal(false);
  };

  const deleteGroup = id => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      api.deleteGroup(id).then(res => {
        const [error] = res;
        if (error) {
          alert(error);
        } else {
          dispatch(getGroups());
        }
      });
    }
  };

  const showCumulativePrivilegesInfo = () => {
    //more than one group configured + Everyone group has all privileges on + at least one other group without all privileges.
    return (
      groups !== undefined &&
      groups.length > 1 &&
      groups.filter(group => GroupModel.isEveryoneWithAllPrivileges(group)).length > 0 &&
      groups.filter(group => GroupModel.notEveryoneWithoutAllPrivileges(group)).length > 0
    );
  };

  return (
    <StyledBox>
      <DocumentationContainer filename={"UserGroup.md"}>
        <Title title={"User Groups"} />
        {showCumulativePrivilegesInfo() ? (
          <AvniAlert severity={"info"} variant={"outlined"}>
            It appears you would like to use fine grained access control.
            <br />
            Since privileges are cumulative across groups, you will need to turn off 'All privileges' in the Everyone group for your custom
            configuration to work.
          </AvniAlert>
        ) : null}
        <br />
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={openModal}
          onClose={() => setOpenModal(false)}
        >
          <StyledModalPaper>
            <h4 id="group-title">Create a new Group</h4>
            <Grid container>
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
            <StyledModalButtonContainer>
              <Button variant="contained" color="primary" onClick={() => groupCreationHandler()}>
                {"Create New Group"}
              </Button>
            </StyledModalButtonContainer>
          </StyledModalPaper>
        </Modal>
        <StyledGrid container>
          <StyledCreateButton variant="contained" color="primary" onClick={() => setOpenModal(true)}>
            {"Create Group"}
          </StyledCreateButton>
        </StyledGrid>
        <Grid container>
          {map(groups, (group, index) => (
            <GroupCard
              key={index}
              groupName={group.name}
              hasAllPrivileges={group.hasAllPrivileges}
              href={`/admin/userGroupDetails/${group.id}`}
              onDelete={() => deleteGroup(group.id)}
            />
          ))}
        </Grid>
      </DocumentationContainer>
    </StyledBox>
  );
};

export default UserGroups;
