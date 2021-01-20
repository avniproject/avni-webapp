import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { bold } from "ansi-colors";
import moment from "moment/moment";
import Observations from "dataEntryApp/components/Observations";
import GridCommonList from "../components/GridCommonList";
import { Paper } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { InternalLink } from "../../../../common/components/utils";
import ConfirmDialog from "../../../components/ConfirmDialog";
import SubjectVoided from "../../../components/SubjectVoided";
import GroupSubjectMemberCardView from "../../../components/GroupSubjectMemberCardView";
import GridCardView from "../../../components/GridCardView";
import { sortBy } from "lodash";
import GroupMembershipCardView from "../../../components/GroupMembershipCardView";

const useStyles = makeStyles(theme => ({
  expansionHeading: {
    fontSize: "1rem",
    flexBasis: "33.33%",
    flexShrink: 0,
    fontWeight: "500",
    margin: "0"
  },
  expansionSecondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary
  },
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    boxShadow: "0px 0px 4px 1px rgba(0,0,0,0.3)"
  },
  expansionSubHeading: {
    fontSize: theme.typography.pxToRem(13),
    flexBasis: "33.33%",
    flexShrink: 0,
    fontWeight: "400",
    margin: "0"
  },
  listItemView: {
    border: "1px solid lightGrey"
  },
  expansionPanel: {
    marginBottom: "11px",
    borderRadius: "5px",
    boxShadow:
      "0px 0px 3px 1px rgba(0,0,0,0.2), 0px 1px 2px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
  },
  card: {
    boxShadow: "0px 0px 0px 0px rgba(0,0,0,0.12)",
    borderRight: "1px solid rgba(0,0,0,0.12)",
    borderRadius: "0"
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 14
  },
  headingBold: {
    fontWeight: bold
  },
  gridBottomBorder: {
    borderBottom: "1px solid rgba(0,0,0,0.12)",
    paddingBottom: "10px"
  },
  infomsg: {
    marginLeft: 10
  },
  expandMoreIcon: {
    color: "#0e6eff"
  }
}));

const SubjectDashboardProfileTab = ({
  profile,
  path,
  voidSubject,
  unVoidSubject,
  registrationForm,
  showRelatives,
  showGroupMembers,
  getGroupMembers,
  groupMembers
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [voidConfirmation, setVoidConfirmation] = React.useState(false);
  const [unVoidConfirmation, setUnVoidConfirmation] = React.useState(false);
  const [membersChanged, setMembersChanged] = React.useState(false);
  React.useEffect(() => {
    if (membersChanged) {
      getGroupMembers(profile.uuid);
      setMembersChanged(false);
    }
  }, [membersChanged]);

  useEffect(() => {
    if (showGroupMembers) {
      getGroupMembers(profile.uuid);
    }
    sessionStorage.removeItem("selectedRelativeslist");
  }, []);

  let relativeList = [];

  if (profile && profile.relationships) {
    profile.relationships.forEach(function(row, index) {
      if (row.exitDateTime === undefined) {
        let sub = {
          enterDateTime: row.enterDateTime,
          id: row.id,
          uuid: row.id
        };
        relativeList.push(sub);
      }
    });
  }

  function renderSubjectProfile() {
    return (
      <ExpansionPanel className={classes.expansionPanel}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}
          aria-controls="registrationPanelbh-content"
          id="profile-detail"
        >
          <Typography component={"span"}>
            <p className={classes.expansionHeading}>{t("registrationDetails")}</p>
            <p className={classes.expansionSubHeading}>
              {t("registrationDate")}:{" "}
              {moment(new Date(profile.registrationDate)).format("DD-MM-YYYY")}
            </p>
            {profile.dateOfBirth && (
              <p className={classes.expansionSubHeading}>
                {t("dateOfBirth")}: {moment(new Date(profile.dateOfBirth)).format("DD-MM-YYYY")}
              </p>
            )}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid item xs={12}>
            <List>
              <Observations
                observations={profile ? profile.observations : []}
                form={registrationForm}
              />
            </List>
            {
              <Button color="primary" onClick={() => setVoidConfirmation(true)}>
                {t("void")}
              </Button>
            }
            {/* <Button color="primary">{t("edit")}</Button> */}
            {
              <Button color="primary" id={"edit-profile"}>
                <InternalLink
                  to={`/app/editSubject?uuid=${profile.uuid}&type=${profile.subjectType.name}`}
                >
                  {t("edit")}{" "}
                </InternalLink>
              </Button>
            }
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }

  function renderRelatives() {
    return (
      <ExpansionPanel className={classes.expansionPanel}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}
          aria-controls="relativesPanelbh-content"
          id="relativesPanelbh-header"
        >
          <Typography component={"span"} className={classes.expansionHeading}>
            {t("Relatives")}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{ paddingTop: "0px" }}>
          {profile.relationships !== undefined && relativeList.length !== 0 ? (
            <GridCommonList
              profileUUID={profile.uuid}
              profileName={profile.firstName + " " + profile.lastName}
              gridListDetails={profile.relationships}
            />
          ) : (
            <Typography variant="caption" gutterBottom className={classes.infomsg}>
              {" "}
              {t("noRelativesAdded")}{" "}
            </Typography>
          )}
        </ExpansionPanelDetails>
        {
          <Button color="primary">
            <InternalLink to={`/app/subject/addRelative?uuid=${profile.uuid}`}>
              {" "}
              {t("addARelative")}{" "}
            </InternalLink>{" "}
          </Button>
        }
      </ExpansionPanel>
    );
  }

  function renderGroupMembers() {
    return (
      <ExpansionPanel className={classes.expansionPanel}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}
          aria-controls="groupMembersPanelbh-content"
          id="groupMembersPanelbh-header"
        >
          <Typography component={"span"} className={classes.expansionHeading}>
            {t("members")}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{ paddingTop: "0px", display: "block" }}>
          {profile.roles && profile.roles.length > 0 ? (
            sortBy(profile.roles, [profileRole => profileRole.role]).map((profileRole, index) => {
              return (
                <ExpansionPanel className={classes.expansionPanel} defaultExpanded>
                  <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}
                    aria-controls="groupMembersRolePanelbh-content"
                    id="groupMembersRolePanelbh-header"
                  >
                    <Typography component={"span"} className={classes.expansionHeading} key={index}>
                      {profileRole.role}
                    </Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <GridCardView
                      cards={sortBy(groupMembers, [
                        groupMember => groupMember.memberSubject.firstName.toLowerCase()
                      ])
                        .filter(groupMember => groupMember.groupRole.uuid === profileRole.uuid)
                        .map(groupMember => (
                          <GroupSubjectMemberCardView
                            setMembersChanged={setMembersChanged}
                            groupSubject={groupMember}
                          />
                        ))}
                    />
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              );
            })
          ) : (
            <Typography variant="caption" gutterBottom className={classes.infomsg}>
              {" "}
              {t("noGroupMembersAdded")}{" "}
            </Typography>
          )}
        </ExpansionPanelDetails>
        {
          <Button color="primary">
            <InternalLink to={`/app/subject/addGroupMember`}>
              {/*?groupSubject=${profile.uuid}*/} {t("addAGroupMember")}{" "}
            </InternalLink>{" "}
          </Button>
        }
      </ExpansionPanel>
    );
  }

  function renderGroupMemberships() {
    const groupMembershipCards = profile.memberships.map(membership => {
      return <GroupMembershipCardView groupMembership={membership} />;
    });
    return (
      <ExpansionPanel className={classes.expansionPanel}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}
          aria-controls="groupMembershipsPanelbh-content"
          id="groupMembershipsPanelbh-header"
        >
          <Typography component={"span"} className={classes.expansionHeading}>
            {t("Memberships")}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{ paddingTop: "0px" }}>
          <GridCardView cards={groupMembershipCards} />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }

  const renderDialog = (title, open, setOpen, message, onConfirm) => (
    <ConfirmDialog
      title={title}
      open={open}
      setOpen={setOpen}
      message={message}
      onConfirm={onConfirm}
    />
  );

  return (
    <Fragment>
      {profile && profile.voided ? (
        <Paper className={classes.root}>
          <SubjectVoided onUnVoid={() => setUnVoidConfirmation(true)} showUnVoid={true} />
          {renderDialog(
            "Un-Void the subject",
            unVoidConfirmation,
            setUnVoidConfirmation,
            "Are you sure you want to un-void this subject?",
            unVoidSubject
          )}
        </Paper>
      ) : (
        <Paper className={classes.root}>
          {renderSubjectProfile()}
          {showRelatives && profile.isPerson() && renderRelatives()}
          {showGroupMembers && renderGroupMembers()}
          {profile.memberships && profile.memberships.length > 0 && renderGroupMemberships()}
          {renderDialog(
            "Void the subject",
            voidConfirmation,
            setVoidConfirmation,
            "Are you sure you want to void this subject?",
            voidSubject
          )}
        </Paper>
      )}
    </Fragment>
  );
};

export default SubjectDashboardProfileTab;
