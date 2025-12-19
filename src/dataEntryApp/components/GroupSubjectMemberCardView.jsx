import { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  CardActions,
  Button,
  Typography,
  DialogContent,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { InternalLink } from "../../common/components/utils";
import { useTranslation } from "react-i18next";
import Modal from "../views/subjectDashBoard/components/CommonModal";
import { noop } from "lodash";
import api from "../api";
import SubjectCardView from "./SubjectCardView";
import { getAPIErrorMessage } from "../sagas/sagaUtils";

const StyledCardActions = styled(CardActions)({
  display: "flex",
  justifyContent: "space-between",
});

const StyledDialogContent = styled(DialogContent)({
  width: 600,
  height: "auto",
});

const StyledEditButton = styled(Button)({
  minWidth: "0px",
});

const removeButtonStyle = (theme) => ({
  height: "28px",
  zIndex: 1,
  marginTop: "1px",
  boxShadow: "none",
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.background.paper,
    textDecoration: "underline",
  },
});

const applyButtonStyle = {
  float: "left",
  backgroundColor: "#f27510",
  height: "30px",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#f27510",
  },
};

const cancelButtonStyle = {
  float: "left",
  backgroundColor: "#F8F9F9",
  color: "#fc9153",
  border: "1px solid #fc9153",
  height: "30px",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#F8F9F9",
  },
};

const GroupSubjectMemberCardView = ({
  setMembersChanged,
  groupSubject: {
    memberSubject,
    encounterMetadata: { dueEncounters, overdueEncounters },
    uuid,
  },
}) => {
  const { t } = useTranslation();
  const [error, setError] = useState(null);

  return (
    <SubjectCardView
      uuid={memberSubject.uuid}
      name={memberSubject.nameString}
      profilePicture={memberSubject.profilePicture}
      gender={memberSubject.gender && memberSubject.gender.name}
      age={
        memberSubject.dateOfBirth &&
        memberSubject.getAgeInYears() + " " + t("years")
      }
      location={
        memberSubject.lowestAddressLevel &&
        memberSubject.lowestAddressLevel.name
      }
      subjectTypeName={memberSubject.subjectType.name}
    >
      {dueEncounters && dueEncounters > 0 ? (
        <Typography
          sx={{
            color: (theme) => theme.palette.text.secondary,
            textAlign: "center",
          }}
        >
          {t("Due") + ": " + dueEncounters}
        </Typography>
      ) : (
        ""
      )}
      {overdueEncounters && overdueEncounters > 0 ? (
        <Typography
          sx={{
            color: (theme) => theme.palette.text.secondary,
            textAlign: "center",
          }}
        >
          {t("Overdue") + ": " + overdueEncounters}
        </Typography>
      ) : (
        ""
      )}
      <StyledCardActions>
        <StyledEditButton color="primary">
          <InternalLink to={`/app/subject/editGroupMembership?uuid=${uuid}`}>
            {t("edit")}
          </InternalLink>
        </StyledEditButton>
        <Modal
          content={
            <StyledDialogContent>
              <Grid container direction="row" sx={{ alignItems: "flex-start" }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {t("removeMemberConfirmationMessage")}
                </Typography>
              </Grid>
            </StyledDialogContent>
          }
          handleError={noop}
          buttonsSet={[
            {
              buttonType: "openButton",
              label: t("remove"),
              sx: removeButtonStyle,
            },
            {
              buttonType: "applyButton",
              label: "Remove",
              redirectTo: ``,
              sx: applyButtonStyle,
              click: () => {
                api
                  .deleteGroupSubject(uuid)
                  .then(() => setTimeout(() => setMembersChanged(true), 250))
                  .catch((e) => setError(getAPIErrorMessage(e)));
              },
            },
            {
              buttonType: "cancelButton",
              label: t("cancel"),
              sx: cancelButtonStyle,
            },
          ]}
          title="Remove Member"
          btnHandleClose={noop}
        />
      </StyledCardActions>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {t(error)}
        </Alert>
      </Snackbar>
    </SubjectCardView>
  );
};

export default GroupSubjectMemberCardView;
