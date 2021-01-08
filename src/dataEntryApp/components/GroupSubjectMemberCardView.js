import React from "react";
import SubjectCardView from "./SubjectCardView";
// import {CardActions} from "@material-ui/core";
// import Button from "@material-ui/core/Button";
// import {InternalLink} from "../../common/components/utils";
import { useTranslation } from "react-i18next";
import Typography from "@material-ui/core/Typography";

// const handleDelete = () => {

// }
const GroupSubjectMemberCardView = ({
  groupSubject: {
    memberSubject,
    encounterMetadata: { dueEncounters, overdueEncounters },
    groupRole,
    uuid
  }
}) => {
  const { t } = useTranslation();

  return (
    <SubjectCardView
      uuid={memberSubject.uuid}
      name={memberSubject.nameString}
      gender={memberSubject.gender && memberSubject.gender.name}
      age={memberSubject.dateOfBirth && memberSubject.getAgeInYears() + " " + t("years")}
      location={memberSubject.lowestAddressLevel && memberSubject.lowestAddressLevel.name}
    >
      {dueEncounters && dueEncounters > 0 ? (
        <Typography color="textSecondary" align={"center"}>
          {t("Due") + ": " + dueEncounters}
        </Typography>
      ) : (
        ""
      )}
      {overdueEncounters && overdueEncounters > 0 ? (
        <Typography color="textSecondary" align={"center"}>
          {t("Overdue") + ": " + overdueEncounters}
        </Typography>
      ) : (
        ""
      )}
      {/*<CardActions>*/}
      {/*  <Button color="primary">*/}
      {/*    <InternalLink to={`/app/subject/editGroupSubjectMembership?uuid=${uuid}`}>*/}
      {/*      {t("edit")}*/}
      {/*    </InternalLink>*/}
      {/*  </Button>*/}
      {/*  <Button color="primary" onClick={handleDelete}>*/}
      {/*      {t("remove")}*/}
      {/*  </Button>*/}
      {/*</CardActions>*/}
    </SubjectCardView>
  );
};

export default GroupSubjectMemberCardView;
