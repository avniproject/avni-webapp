import React from "react";
import SubjectCardView from "./SubjectCardView";
import { Typography } from "@material-ui/core";

const GroupSubjectMember = ({ groupSubjectMember, onRemoveFromGroup }) => {
  return (
    <div>
      <SubjectCardView
        name={groupSubjectMember.name}
        gender={groupSubjectMember.gender}
        age={groupSubjectMember.age}
        location={groupSubjectMember.location}
      >
        <Typography
          component={"div"}
          // className={classes.title}
          color="textSecondary"
          gutterBottom
        >
          {groupSubjectMember.role}
        </Typography>
      </SubjectCardView>
    </div>
  );
};

export default GroupSubjectMember;
