import React from "react";
import SubjectCardView from "./SubjectCardView";
import { makeStyles } from "@mui/styles";
import { CardActions, Button, Typography, DialogContent, Grid } from "@mui/material";
import { InternalLink } from "../../common/components/utils";
import { useTranslation } from "react-i18next";
import Modal from "../views/subjectDashBoard/components/CommonModal";
import { noop } from "lodash";
import api from "../api";
import { withStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  cardActions: {
    display: "flex",
    justifyContent: "space-between"
  },
  removeButtonStyle: {
    height: "28px",
    zIndex: 1,
    marginTop: "1px",
    boxShadow: "none",
    color: "#0e6eff",
    backgroundColor: "#fff",
    "&:hover": {
      color: "#0e6eff",
      backgroundColor: "#fff"
    }
  },
  btnCustom: {
    float: "left",
    backgroundColor: "#f27510",
    height: "30px",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#f27510"
    }
  },
  cancelBtnCustom: {
    float: "left",
    backgroundColor: "#F8F9F9",
    color: "#fc9153",
    border: "1px solid #fc9153",
    height: "30px",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#F8F9F9"
    }
  }
}));

const GroupSubjectMemberCardView = ({
  setMembersChanged,
  groupSubject: {
    memberSubject,
    encounterMetadata: { dueEncounters, overdueEncounters },
    // groupRole,
    uuid
  }
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const EditButton = withStyles({
    root: {
      minWidth: "0px"
    }
  })(Button);

  const removeGroupMemberDialogContent = (
    <DialogContent style={{ width: 600, height: "auto" }}>
      <Grid container direction="row" alignItems="flex-start">
        <Typography variant="subtitle1" gutterBottom>
          {t("removeMemberConfirmationMessage")}
        </Typography>
      </Grid>
    </DialogContent>
  );

  return (
    <div>
      <SubjectCardView
        uuid={memberSubject.uuid}
        name={memberSubject.nameString}
        profilePicture={memberSubject.profilePicture}
        gender={memberSubject.gender && memberSubject.gender.name}
        age={memberSubject.dateOfBirth && memberSubject.getAgeInYears() + " " + t("years")}
        location={memberSubject.lowestAddressLevel && memberSubject.lowestAddressLevel.name}
        subjectTypeName={memberSubject.subjectType.name}
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
        <CardActions className={classes.cardActions}>
          <EditButton color="primary">
            <InternalLink to={`/app/subject/editGroupMembership?uuid=${uuid}`}>{t("edit")}</InternalLink>
          </EditButton>
          <Modal
            content={removeGroupMemberDialogContent}
            handleError={noop}
            buttonsSet={[
              {
                buttonType: "openButton",
                label: t("remove"),
                classes: classes.removeButtonStyle
              },
              {
                buttonType: "applyButton",
                label: "Remove",
                redirectTo: ``,
                classes: classes.btnCustom,
                click: () => {
                  api.deleteGroupSubject(uuid).then(() => setTimeout(() => setMembersChanged(true), 250));
                }
              },
              {
                buttonType: "cancelButton",
                label: t("cancel"),
                classes: classes.cancelBtnCustom
              }
            ]}
            title="Remove Member"
            btnHandleClose={noop}
          />
        </CardActions>
      </SubjectCardView>
    </div>
  );
};

export default GroupSubjectMemberCardView;
