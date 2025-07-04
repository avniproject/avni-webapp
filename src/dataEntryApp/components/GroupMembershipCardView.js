import SubjectCardView from "./SubjectCardView";
import { Typography } from "@mui/material";

const GroupMembershipCardView = ({ groupMembership: { groupSubject, groupRole } }) => {
  return (
    <div>
      <SubjectCardView
        uuid={groupSubject.uuid}
        name={groupSubject.name}
        profilePicture={groupSubject.profilePicture}
        subjectTypeName={groupSubject.subjectType.name}
      >
        <Typography component={"div"} sx={{ color: theme => theme.palette.text.secondary, mb: 1, textAlign: "center" }}>
          {groupRole.role}
        </Typography>
      </SubjectCardView>
    </div>
  );
};

export default GroupMembershipCardView;
