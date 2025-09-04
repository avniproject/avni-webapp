import { useState, Fragment, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  List,
  Grid,
  Button,
  Paper,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { format, isValid } from "date-fns";
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
import {
  fetchSubjectSummary,
  selectFetchingRulesResponse,
  selectSubjectSummary,
} from "../../../reducers/serverSideRulesReducer";
import RuleSummary from "./RuleSummary";
import SubjectDashboardGeneralTab from "./SubjectDashboardGeneralTab";
import { NewGeneralEncounterButton } from "./NewGeneralEncounterButton";
import { Individual } from "avni-models";
import SubjectDashboardMessagesTab from "./SubjectDashboardMessagesTab";
import { StyledTypographyError } from "../../../../adminApp/Util/Styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  boxShadow: "0px 0px 4px 1px rgba(0,0,0,0.3)",
  elevation: 2,
}));

const StyledAccordion = styled(Accordion)({
  marginBottom: "11px",
  borderRadius: "5px",
  boxShadow:
    "0px 0px 3px 1px rgba(0,0,0,0.2), 0px 1px 2px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)",
});

const StyledAccordionSummary = styled(AccordionSummary)({});

const StyledAccordionDetails = styled(AccordionDetails)({
  paddingTop: "0px",
});

const StyledGroupMembersAccordionDetails = styled(AccordionDetails)({
  paddingTop: "0px",
  display: "block",
});

const StyledTypographyHeading = styled(Typography)({
  fontSize: "1rem",
  flexBasis: "33.33%",
  flexShrink: 0,
  fontWeight: "500",
  margin: "0",
});

const StyledTypographySubHeading = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(13),
  flexBasis: "33.33%",
  flexShrink: 0,
  fontWeight: "400",
  margin: "0",
}));

const StyledTypographyNoItems = styled(Typography)({
  marginBottom: 8, // Converted from sx={{ mb: 1 }} (1 * 8px = 8px)
});

const StyledExpandMore = styled(ExpandMore)({
  color: "#0e6eff",
});

const StyledButton = styled(Button)({
  // Common button styles if needed
});

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
  unVoidErrorKey,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [voidConfirmation, setVoidConfirmation] = useState(false);
  const [unVoidConfirmation, setUnVoidConfirmation] = useState(false);
  const [membersChanged, setMembersChanged] = useState(false);
  const subjectSummary = useSelector(selectSubjectSummary);
  const isFetchingSummary = useSelector(selectFetchingRulesResponse);

  useEffect(() => {
    dispatch(fetchSubjectSummary(profile.uuid));
  }, [dispatch]);

  useEffect(() => {
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
    profile.relationships.forEach(function (row) {
      if (row.exitDateTime === undefined) {
        let sub = {
          enterDateTime: row.enterDateTime,
          id: row.id,
          uuid: row.id,
        };
        relativeList.push(sub);
      }
    });
  }

  function renderSubjectProfile() {
    return (
      <StyledAccordion>
        <StyledAccordionSummary
          expandIcon={<StyledExpandMore />}
          aria-controls="registrationPanelbh-content"
          id="profile-detail"
        >
          <StyledTypographyHeading component="div">
            {t("registrationDetails")}
            <StyledTypographySubHeading component="div">
              {t("registrationDate")}:{" "}
              {profile.registrationDate &&
              isValid(new Date(profile.registrationDate))
                ? format(new Date(profile.registrationDate), "dd-MM-yyyy")
                : "-"}
            </StyledTypographySubHeading>
            {!hideDOB && profile.dateOfBirth && (
              <StyledTypographySubHeading component="div">
                {t("dateOfBirth")}:{" "}
                {profile.dateOfBirth && isValid(new Date(profile.dateOfBirth))
                  ? format(new Date(profile.dateOfBirth), "dd-MM-yyyy")
                  : "-"}
              </StyledTypographySubHeading>
            )}
          </StyledTypographyHeading>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <Grid size={12}>
            <List>
              <Observations
                observations={profile ? profile.observations : []}
                form={registrationForm}
              />
            </List>
            <StyledButton
              color="primary"
              onClick={() => setVoidConfirmation(true)}
            >
              {t("void")}
            </StyledButton>
            <StyledButton color="primary" id="edit-profile">
              <InternalLink
                to={`/app/editSubject?uuid=${profile.uuid}&type=${
                  profile.subjectType.name
                }`}
              >
                {t("edit")}
              </InternalLink>
            </StyledButton>
          </Grid>
        </StyledAccordionDetails>
      </StyledAccordion>
    );
  }

  function renderRelatives() {
    return (
      <StyledAccordion>
        <StyledAccordionSummary
          expandIcon={<StyledExpandMore />}
          aria-controls="relativesPanelbh-content"
          id="relativesPanelbh-header"
        >
          <StyledTypographyHeading component="span">
            {t("Relatives")}
          </StyledTypographyHeading>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          {profile.relationships !== undefined && relativeList.length !== 0 ? (
            <GridCommonList
              profileUUID={profile.uuid}
              profileName={Individual.getFullName(profile)}
              gridListDetails={profile.relationships}
            />
          ) : (
            <StyledTypographyNoItems variant="caption">
              {t("noRelativesAdded")}
            </StyledTypographyNoItems>
          )}
        </StyledAccordionDetails>
        <StyledButton color="primary">
          <InternalLink to={`/app/subject/addRelative?uuid=${profile.uuid}`}>
            {t("addARelative")}
          </InternalLink>
        </StyledButton>
      </StyledAccordion>
    );
  }

  function renderGroupMembers() {
    return (
      <StyledAccordion>
        <StyledAccordionSummary
          expandIcon={<StyledExpandMore />}
          aria-controls="groupMembersPanelbh-content"
          id="groupMembersPanelbh-header"
        >
          <StyledTypographyHeading component="span">
            {t("members")}
          </StyledTypographyHeading>
        </StyledAccordionSummary>
        <StyledGroupMembersAccordionDetails>
          {profile.roles && profile.roles.length > 0 ? (
            sortBy(profile.roles, [(profileRole) => profileRole.role]).map(
              (profileRole, index) => (
                <StyledAccordion key={index} defaultExpanded>
                  <StyledAccordionSummary
                    expandIcon={<StyledExpandMore />}
                    aria-controls="groupMembersRolePanelbh-content"
                    id="groupMembersRolePanelbh-header"
                  >
                    <StyledTypographyHeading component="span">
                      {t(profileRole.role)}
                    </StyledTypographyHeading>
                  </StyledAccordionSummary>
                  <StyledAccordionDetails>
                    <GridCardView
                      cards={sortBy(groupMembers, [
                        (groupMember) =>
                          groupMember.memberSubject.firstName.toLowerCase(),
                      ])
                        .filter(
                          (groupMember) =>
                            groupMember.groupRole.uuid === profileRole.uuid,
                        )
                        .map((groupMember) => (
                          <GroupSubjectMemberCardView
                            key={groupMember.uuid}
                            setMembersChanged={setMembersChanged}
                            groupSubject={groupMember}
                          />
                        ))}
                    />
                  </StyledAccordionDetails>
                </StyledAccordion>
              ),
            )
          ) : (
            <StyledTypographyNoItems variant="caption">
              {t("noGroupMembersAdded")}
            </StyledTypographyNoItems>
          )}
        </StyledGroupMembersAccordionDetails>
        <StyledButton color="primary">
          <InternalLink to={`/app/subject/addGroupMember`}>
            {t("addMember")}
          </InternalLink>
        </StyledButton>
      </StyledAccordion>
    );
  }

  function renderGroupMemberships() {
    const groupMembershipCards = profile.memberships.map((membership) => (
      <GroupMembershipCardView
        key={membership.uuid}
        groupMembership={membership}
      />
    ));
    return (
      <StyledAccordion>
        <StyledAccordionSummary
          expandIcon={<StyledExpandMore />}
          aria-controls="groupMembershipsPanelbh-content"
          id="groupMembershipsPanelbh-header"
        >
          <StyledTypographyHeading component="span">
            {t("Memberships")}
          </StyledTypographyHeading>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <GridCardView cards={groupMembershipCards} />
        </StyledAccordionDetails>
      </StyledAccordion>
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
        <StyledPaper>
          <SubjectVoided
            onUnVoid={() => setUnVoidConfirmation(true)}
            showUnVoid={true}
          />
          {!_.isEmpty(unVoidErrorKey) && (
            <StyledTypographyError variant="button">
              {t(unVoidErrorKey)}
            </StyledTypographyError>
          )}
          {renderDialog(
            "Un-Void the subject",
            unVoidConfirmation,
            setUnVoidConfirmation,
            "Are you sure you want to un-void this subject?",
            unVoidSubject,
          )}
        </StyledPaper>
      ) : (
        <StyledPaper>
          {!profile.voided && displayGeneralInfoInProfileTab && (
            <NewGeneralEncounterButton subjectUuid={profile.uuid} />
          )}
          <RuleSummary
            title="subjectSummary"
            isFetching={isFetchingSummary}
            summaryObservations={subjectSummary}
          />
          {renderSubjectProfile()}
          {showRelatives && profile.isPerson() && renderRelatives()}
          {showGroupMembers && renderGroupMembers()}
          {profile.memberships &&
            profile.memberships.length > 0 &&
            renderGroupMemberships()}
          {renderDialog(
            t("SubjectVoidAlertTitle"),
            voidConfirmation,
            setVoidConfirmation,
            t("SubjectVoidAlertMessage"),
            voidSubject,
          )}
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
        </StyledPaper>
      )}
      <MessageDialog
        title={t("SubjectErrorTitle")}
        open={!isEmpty(voidError)}
        message={t(voidError)}
        onOk={clearVoidServerError}
      />
    </Fragment>
  );
};

export default SubjectDashboardProfileTab;
