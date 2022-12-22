import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import api from "./api/index";
import { HomePageCard } from "../rootApp/views/HomePageCard";
import { Typography } from "@material-ui/core";
import SubjectAssignment from "./subjectAssignment/SubjectAssignment";
import TaskAssignment from "./taskAssignment/TaskAssignment";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";

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

const renderOptions = () => {
  return (
    <AppBarContainer>
      <HomePageCard
        href={"/#/assignment/task"}
        name={"Task Assignment"}
        customIcon={"assignment_turned_in"}
      />
      <HomePageCard
        href={"/#/assignment/subject"}
        name={"Subject Assignment"}
        customIcon={"assignment_turned_in"}
      />
    </AppBarContainer>
  );
};

const renderEmptyMessage = () => {
  return (
    <AppBarContainer>
      <Typography component={"div"} variant={"h6"} gutterBottom>
        {"No Task or subject assignment setup for the organisation"}
      </Typography>
    </AppBarContainer>
  );
};

function Assignment() {
  const [metadata, setMetadata] = useState(initialState);
  const { isAnyDirectlyAssignable, isAnyTaskTypeSetup, loaded } = metadata;

  useEffect(() => {
    api.getAssignmentMetadata().then(metadata => setMetadata({ ...metadata, loaded: true }));
  }, []);

  if (loaded) {
    if (isAnyDirectlyAssignable && isAnyTaskTypeSetup) {
      return renderOptions();
    } else if (isAnyDirectlyAssignable) {
      return <SubjectAssignment />;
    } else if (isAnyTaskTypeSetup) {
      return <TaskAssignment />;
    } else {
      return renderEmptyMessage();
    }
  } else {
    return <div />;
  }
}

export default withRouter(Assignment);
