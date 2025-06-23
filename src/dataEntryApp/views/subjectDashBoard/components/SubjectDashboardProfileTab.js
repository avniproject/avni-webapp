import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { Accordion, AccordionDetails, AccordionSummary, Typography, List, Grid, Button, Paper } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { bold } from "ansi-colors";
import moment from "moment/moment";
import Observations from "dataEntryApp/components/Observations";
import GridCommonList from "../components/GridCommonList";
import { useTranslation } from "react-i18next";
import { InternalLink } from "../../../../common/components/utils";
import ConfirmDialog from "../../../components/ConfirmDialog";
import SubjectVoided from "../../../components/SubjectVoided";
import GroupSubjectMemberCardView from "../../../components/GroupSubjectMemberCardView";
import GridCardView from "../../../components/GridCardView";
import _, { isEmpty, sortBy } from "lodash";
import GroupMembershipCardView from "../../../components/GroupMembershipCardView";
import MessageDialog from "../../../components/MessageDialog";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubjectSummary, selectFetchingRulesResponse, selectSubjectSummary } from "../../../reducers/serverSideRulesReducer";
import { RuleSummary } from "./RuleSummary";
import SubjectDashboardGeneralTab from "./subjectDashboardGeneralTab";
import { NewGeneralEncounterButton } from "./NewGeneralEncounterButton";
import { Individual } from "avni-models";
import SubjectDashboardMessagesTab from "./SubjectDashboardMessagesTab";

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
    boxShadow: "0px 0px 3px 1px rgba(0,0,0,0.2), 0px 1px 2px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
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
  expandMoreHoriz: {
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
  groupMembers,
  voidError,
  clearVoidServerError,
  hideDOB,
  general,
  displayGeneralInfoInProfileTab,
  msgs,
  showMessagesTab,
  unVoidErrorKey
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [voidConfirmation, setVoidConfirmation] = React.useState(false);
  const [unVoidConfirmation, setUnVoidConfirmation] = React.useState(false);
  const [membersChanged, setMembersChanged] = React.useState(false);
  const subjectSummary = useSelector(selectSubjectSummary);
  const isFetchingSummary = useSelector(selectFetchingRulesResponse);

  useEffect(() => {
    dispatch(fetchSubjectSummary(profile.uuid));
  }, [dispatch]);

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
      <Accordion className={classes.expansionPanel}>
        <AccordionSummary
          expandIcon={<ExpandMore className={classes.expandMoreHoriz} />}
          aria-controls="registrationPanelbh-content"
          id="profile-detail"
        >
          <Typography component={"span"}>
            <p className={classes.expansionHeading}>{t("registrationDetails")}</p>
            <p className={classes.expansionSubHeading}>
              {t("registrationDate")}: {moment(new Date(profile.registrationDate)).format("DD-MM-YYYY")}
            </p>
            {!hideDOB && profile.dateOfBirth && (
              <p className={classes.expansionSubHeading}>
                {t("dateOfBirth")}: {moment(new Date(profile.dateOfBirth)).format("DD-MM-YYYY")}
              </p>
            )}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid item xs={12}>
            <List>
              <Observations observations={profile ? profile.observations : []} form={registrationForm} />
            </List>
            {
              <Button color="primary" onClick={() => setVoidConfirmation(true)}>
                {t("void")}
              </Button>
            }
            {/* <Button color="primary">{t("edit")}</Button> */}
            {
              <Button color="primary" id={"edit-profile"}>
                <InternalLink to={`/app/editSubject?uuid=${profile.uuid}&type=${profile.subjectType.name}`}>{t("edit")} </InternalLink>
              </Button>
            }
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  }

  function renderRelatives() {
    return (
      <Accordion className={classes.expansionPanel}>
        <AccordionSummary
          expandIcon={<ExpandMore className={classes.expandMoreHoriz} />}
          aria-controls="relativesPanelbh-content"
          id="relativesPanelbh-header"
        >
          <Typography component={"span"} className={classes.expansionHeading}>
            {t("Relatives")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails style={{ paddingTop: "0px" }}>
          {profile.relationships !== undefined && relativeList.length !== 0 ? (
            <GridCommonList
              profileUUID={profile.uuid}
              profileName={Individual.getFullName(profile)}
              gridListDetails={profile.relationships}
            />
          ) : (
            <Typography variant="caption" sx={{ mb: 1 }} className={classes.infomsg}>
              {" "}
              {t("noRelativesAdded")}{" "}
            </Typography>
          )}
        </AccordionDetails>
        {
          <Button color="primary">
            <InternalLink to={`/app/subject/addRelative?uuid=${profile.uuid}`}> {t("addARelative")} </InternalLink>{" "}
          </Button>
        }
      </Accordion>
    );
  }

  function renderGroupMembers() {
    return (
      <Accordion className={classes.expansionPanel}>
        <AccordionSummary
          expandIcon={<ExpandMore className={classes.expandMoreHoriz} />}
          aria-controls="groupMembersPanelbh-content"
          id="groupMembersPanelbh-header"
        >
          <Typography component={"span"} className={classes.expansionHeading}>
            {t("members")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails style={{ paddingTop: "0px", display: "block" }}>
          {profile.roles && profile.roles.length > 0 ? (
            sortBy(profile.roles, [profileRole => profileRole.role]).map((profileRole, index) => {
              return (
                <Accordion className={classes.expansionPanel} defaultExpanded>
                  <AccordionSummary
                    expandIcon={<ExpandMore className={classes.expandMoreHoriz} />}
                    aria-controls="groupMembersRolePanelbh-content"
                    id="groupMembersRolePanelbh-header"
                  >
                    <Typography component={"span"} className={classes.expansionHeading} key={index}>
                      {t(profileRole.role)}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <GridCardView
                      cards={sortBy(groupMembers, [groupMember => groupMember.memberSubject.firstName.toLowerCase()])
                        .filter(groupMember => groupMember.groupRole.uuid === profileRole.uuid)
                        .map(groupMember => (
                          <GroupSubjectMemberCardView setMembersChanged={setMembersChanged} groupSubject={groupMember} />
                        ))}
                    />
                  </AccordionDetails>
                </Accordion>
              );
            })
          ) : (
            <Typography variant="caption" sx={{ mb: 1 }} className={classes.infomsg}>
              {" "}
              {t("noGroupMembersAdded")}{" "}
            </Typography>
          )}
        </AccordionDetails>
        {
          <Button color="primary">
            <InternalLink to={`/app/subject/addGroupMember`}>{t("addMember")}</InternalLink>{" "}
          </Button>
        }
      </Accordion>
    );
  }

  function renderGroupMemberships() {
    const groupMembershipCards = profile.memberships.map(membership => {
      return <GroupMembershipCardView groupMembership={membership} />;
    });
    return (
      <Accordion className={classes.expansionPanel}>
        <AccordionSummary
          expandIcon={<ExpandMore className={classes.expandMoreHoriz} />}
          aria-controls="groupMembershipsPanelbh-content"
          id="groupMembershipsPanelbh-header"
        >
          <Typography component={"span"} className={classes.expansionHeading}>
            {t("Memberships")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails style={{ paddingTop: "0px" }}>
          <GridCardView cards={groupMembershipCards} />
        </AccordionDetails>
      </Accordion>
    );
  }

  const renderDialog = (title, open, setOpen, message, onConfirm) => (
    <ConfirmDialog title={title} open={open} setOpen={setOpen} message={message} onConfirm={onConfirm} />
  );

  return (
    <Fragment>
      {profile && profile.voided ? (
        <Paper className={classes.root}>
          <SubjectVoided onUnVoid={() => setUnVoidConfirmation(true)} showUnVoid={true} />
          {!_.isEmpty(unVoidErrorKey) && (
            <Typography variant="button" sx={{ color: theme => theme.palette.error.main }}>
              {t(unVoidErrorKey)}
            </Typography>
          )}
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
          {!profile.voided && displayGeneralInfoInProfileTab && <NewGeneralEncounterButton subjectUuid={profile.uuid} />}
          <RuleSummary title={"subjectSummary"} isFetching={isFetchingSummary} summaryObservations={subjectSummary} />
          {renderSubjectProfile()}
          {showRelatives && profile.isPerson() && renderRelatives()}
          {showGroupMembers && renderGroupMembers()}
          {profile.memberships && profile.memberships.length > 0 && renderGroupMemberships()}
          {renderDialog(t("SubjectVoidAlertTitle"), voidConfirmation, setVoidConfirmation, t("SubjectVoidAlertMessage"), voidSubject)}
          {displayGeneralInfoInProfileTab && (
            <SubjectDashboardGeneralTab
              subjectUuid={profile.uuid}
              general={general}
              subjectTypeUuid={profile.subjectType.uuid}
              subjectVoided={profile.voided}
              displayGeneralInfoInProfileTab={displayGeneralInfoInProfileTab}
            />
          )}
          {showMessagesTab && (
            <SubjectDashboardMessagesTab
              sentMessages={msgs.msgsSent}
              msgsYetToBeSent={msgs.msgsNotYetSent}
              isMsgsSentAvailable={msgs.isMsgsSentAvailable}
              isMsgsNotYetSentAvailable={msgs.isMsgsNotYetSentAvailable}
            />
          )}
        </Paper>
      )}
      <MessageDialog title={t("SubjectErrorTitle")} open={!isEmpty(voidError)} message={t(voidError)} onOk={clearVoidServerError} />
    </Fragment>
  );
};

export default SubjectDashboardProfileTab;
