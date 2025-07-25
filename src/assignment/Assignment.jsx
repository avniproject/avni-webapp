import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "./api/index";
import { HomePageCard } from "../rootApp/views/HomePageCard";
import { Typography } from "@mui/material";
import SubjectAssignment from "./subjectAssignment/SubjectAssignment";
import TaskAssignment from "./taskAssignment/TaskAssignment";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import UserInfo from "../common/model/UserInfo";
import { Privilege } from "openchs-models";

const initialState = { loaded: false };

const AppBarContainer = props => (
  <ScreenWithAppBar appbarTitle={"Assignment"}>
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {props.children}
    </div>
  </ScreenWithAppBar>
);

function renderOptions(canAssignSubject, canEditTask) {
  return (
    <AppBarContainer>
      {canEditTask && (
        <HomePageCard
          href={"/#/assignment/task"}
          name={"Task Assignment"}
          customIcon={"assignment_turned_in"}
        />
      )}
      {canAssignSubject && (
        <HomePageCard
          href={"/#/assignment/subject"}
          name={"Subject Assignment"}
          customIcon={"assignment_turned_in"}
        />
      )}
    </AppBarContainer>
  );
}

function renderEmptyMessage() {
  return (
    <AppBarContainer>
      <Typography component={"div"} variant={"h6"} sx={{ mb: 1 }}>
        {
          "No Task or subject assignment setup for the organisation. Or you do not have privilege to Edit task"
        }
      </Typography>
    </AppBarContainer>
  );
}

function Assignment() {
  const [metadata, setMetadata] = useState(initialState);
  const userInfo = useSelector(state => state.app.userInfo);

  const { isAnyDirectlyAssignable, isAnyTaskTypeSetup, loaded } = metadata;

  useEffect(() => {
    api
      .getAssignmentMetadata()
      .then(metadata => setMetadata({ ...metadata, loaded: true }));
  }, []);

  const canEditTask = UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.EditTask
  );
  const canAssignSubject = UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.AssignSubject
  );

  if (loaded) {
    if (
      isAnyDirectlyAssignable &&
      isAnyTaskTypeSetup &&
      (canEditTask || canAssignSubject)
    ) {
      return renderOptions(canAssignSubject, canEditTask);
    } else if (isAnyDirectlyAssignable && canAssignSubject) {
      return <SubjectAssignment />;
    } else if (isAnyTaskTypeSetup && canEditTask) {
      return <TaskAssignment />;
    } else {
      return renderEmptyMessage();
    }
  } else {
    return <div />;
  }
}

export default Assignment;
