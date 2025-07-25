import { styled } from "@mui/material/styles";
import { Typography, Breadcrumbs as MUIBreadcrumb, Link } from "@mui/material";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { defaultTo } from "lodash";

const StyledBreadcrumbs = styled(MUIBreadcrumb)({
  margin: "12px 24px",
  fontSize: "12px"
});

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: "12px",
  color: theme.palette.text.primary
}));

const Breadcrumbs = ({ path }) => {
  const { t } = useTranslation();

  const subjectProfile = useSelector(
    state => state.dataEntry.subjectProfile.subjectProfile
  );
  const viewVisit = useSelector(
    state => state.dataEntry.viewVisitReducer.encounter
  );
  const programEncounter = useSelector(
    state => state.dataEntry.programEncounterReducer.programEncounter
  );
  const encounter = useSelector(
    state => state.dataEntry.encounterReducer.encounter
  );

  const parts = path.split(/\/+/g).filter(Boolean);
  const subjectName = subjectProfile && subjectProfile.nameString;
  const subjectUuid = subjectProfile && subjectProfile.uuid;
  const viewVisitName =
    viewVisit && defaultTo(viewVisit.name, viewVisit.encounterType.name);
  const programEncounterName =
    programEncounter &&
    defaultTo(programEncounter.name, programEncounter.encounterType.name);
  const encounterName =
    encounter && defaultTo(encounter.name, encounter.encounterType.name);
  const urlPartLabels = {
    APP: "app",
    SUBJECT: "subject",
    SUBJECT_PROFILE: "subjectProfile",
    VIEW_VISIT: "viewProgramEncounter",
    COMPLETED_VISITS: "completedProgramEncounters",
    VIEW_ENCOUNTER: "viewEncounter",
    COMPLETED_ENCOUNTERS: "completedEncounters",
    PROGRAM_ENCOUNTER: "programEncounter",
    EDIT_PROGRAM_ENCOUNTER: "editProgramEncounter",
    CANCEL_PROGRAM_ENCOUNTER: "cancelProgramEncounter",
    EDIT_CANCEL_PROGRAM_ENCOUNTER: "editCancelProgramEncounter",
    NEW_PROGRAM_VISIT: "newProgramVisit",
    NEW_GENERAL_VISIT: "newGeneralVisit",
    ENCOUNTER: "encounter",
    EDIT_ENCOUNTER: "editEncounter",
    CANCEL_ENCOUNTER: "cancelEncounter",
    EDIT_CANCEL_ENCOUNTER: "editCancelEncounter",
    EDIT_SUBJECT: "editSubject",
    SEARCH: "searchFilter",
    REGISTER: "register",
    EDIT_GROUP_MEMBERSHIP: "editGroupMembership"
  };
  const currentPage = parts[parts.length - 1];
  const isSubjectEdit = currentPage === urlPartLabels.EDIT_SUBJECT;
  const clickableParts = isSubjectEdit
    ? parts
    : parts.slice(0, parts.length - 1);
  const urlMapper = part => {
    switch (part) {
      case urlPartLabels.APP: {
        return { breadcrumb: t("home"), url: "#/app" };
      }
      case urlPartLabels.SUBJECT: {
        if (subjectName && subjectUuid) {
          return {
            breadcrumb: subjectName,
            url: "#/app/subject?uuid=" + subjectUuid
          };
        } else {
          return {
            breadcrumb: t("Dashboard"),
            url: "#/app"
          };
        }
      }
      case urlPartLabels.SUBJECT_PROFILE: {
        return {
          breadcrumb: t(urlPartLabels.SUBJECT_PROFILE),
          url: "#/app"
        };
      }
      case urlPartLabels.VIEW_VISIT: {
        if (viewVisitName) {
          return {
            breadcrumb: `${t(viewVisitName)}`,
            url: "#/app"
          };
        } else {
          return { breadcrumb: `${t("ViewVisit")}`, url: "#/app" };
        }
      }
      case urlPartLabels.COMPLETED_VISITS: {
        return { breadcrumb: t("completedVisits"), url: "#/app" };
      }
      case urlPartLabels.VIEW_ENCOUNTER: {
        if (viewVisitName) {
          return {
            breadcrumb: `${t(viewVisitName)}`,
            url: "#/app"
          };
        } else {
          return { breadcrumb: "View Visit", url: "#/app" };
        }
      }
      case urlPartLabels.COMPLETED_ENCOUNTERS: {
        return { breadcrumb: t("completedVisits"), url: "#/app" };
      }
      case urlPartLabels.EDIT_CANCEL_PROGRAM_ENCOUNTER: {
        return {
          breadcrumb: `${t("Edit Cancel Program Encounter")} : ${t(
            programEncounterName
          )}`,
          url: "#/app"
        };
      }
      case urlPartLabels.CANCEL_PROGRAM_ENCOUNTER: {
        return {
          breadcrumb: `${t("Cancel Program Encounter")} : ${t(
            programEncounterName
          )}`,
          url: "#/app"
        };
      }
      case urlPartLabels.PROGRAM_ENCOUNTER: {
        return {
          breadcrumb: `${t("Program Encounter")} : ${t(programEncounterName)}`,
          url: "#/app"
        };
      }
      case urlPartLabels.EDIT_PROGRAM_ENCOUNTER: {
        return {
          breadcrumb: `${t("Edit Program Encounter")} : ${t(
            programEncounterName
          )}`,
          url: "#/app"
        };
      }
      case urlPartLabels.NEW_PROGRAM_VISIT: {
        return { breadcrumb: t("newProgramVisit"), url: "#/app" };
      }
      case urlPartLabels.NEW_GENERAL_VISIT: {
        return {
          breadcrumb: `${t("newGeneralVisit")} : ${t(encounterName)}`,
          url: "#/app"
        };
      }
      case urlPartLabels.ENCOUNTER: {
        return {
          breadcrumb: `${t("Encounter")} : ${t(encounterName)}`,
          url: "#/app"
        };
      }
      case urlPartLabels.EDIT_ENCOUNTER: {
        return {
          breadcrumb: `${t("Edit Encounter")} : ${t(encounterName)}`,
          url: "#/app"
        };
      }
      case urlPartLabels.CANCEL_ENCOUNTER: {
        return {
          breadcrumb: `${t("Cancel Encounter")} : ${t(encounterName)}`,
          url: "#/app"
        };
      }
      case urlPartLabels.EDIT_CANCEL_ENCOUNTER: {
        return {
          breadcrumb: `${t("Edit Cancel Encounter")} : ${t(encounterName)}`,
          url: "#/app"
        };
      }
      case urlPartLabels.EDIT_SUBJECT: {
        return {
          breadcrumb: subjectName,
          url: "#/app/subject?uuid=" + subjectUuid
        };
      }
      case urlPartLabels.SEARCH: {
        return { breadcrumb: t("search"), url: "#/app" };
      }
      case urlPartLabels.REGISTER: {
        return { breadcrumb: t("register"), url: "#/app" };
      }
      case urlPartLabels.EDIT_GROUP_MEMBERSHIP: {
        return {
          breadcrumb: t(urlPartLabels.EDIT_GROUP_MEMBERSHIP),
          url: "#/app"
        };
      }
      default:
        return { breadcrumb: part, url: "#/app" };
    }
  };

  return (
    <StyledBreadcrumbs aria-label="breadcrumb">
      {clickableParts.map((part, index) => (
        <Link key={index} color="inherit" href={urlMapper(part).url}>
          {urlMapper(part).breadcrumb}
        </Link>
      ))}
      <StyledTypography component="span">
        {isSubjectEdit ? t("editSubject") : urlMapper(currentPage).breadcrumb}
      </StyledTypography>
    </StyledBreadcrumbs>
  );
};

export default Breadcrumbs;
