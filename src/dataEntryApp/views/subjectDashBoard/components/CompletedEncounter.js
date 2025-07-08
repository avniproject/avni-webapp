import { useState } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Button, Grid, List, ListItem, ListItemText } from "@mui/material";
import { format, isValid } from "date-fns";
import { defaultTo, isEmpty, isEqual } from "lodash";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { InternalLink } from "../../../../common/components/utils";
import { selectFormMappingForCancelEncounter, selectFormMappingForEncounter } from "../../../sagas/encounterSelector";
import { voidGeneralEncounter } from "../../../reducers/subjectDashboardReducer";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { DeleteButton } from "../../../components/DeleteButton";

const StyledGrid = styled(Grid)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  borderRight: "1px solid rgba(0,0,0,0.12)",
  "&:nth-child(4n),&:last-child": {
    borderRight: "0px solid rgba(0,0,0,0.12)"
  }
}));

const StyledPaper = styled(Paper)({
  textAlign: "left",
  boxShadow: "none",
  borderRadius: "0px",
  padding: "0px"
});

const StyledList = styled(List)({
  paddingBottom: "0px"
});

const StyledListItem = styled(ListItem)({
  paddingBottom: "0px",
  paddingTop: "0px"
});

const StyledListItemText = styled(ListItemText)({
  color: "#2196f3",
  fontSize: "14px",
  textTransform: "uppercase"
});

const StyledListItemTextDate = styled(ListItemText)({
  color: "#555555",
  fontSize: "15px"
});

const StyledStatusLabel = styled("label")(({ isCancelled }) => ({
  fontSize: "12px",
  padding: "2px 5px",
  ...(isCancelled
    ? {
        color: "gray",
        backgroundColor: "#DCDCDC"
      }
    : {
        color: "red",
        backgroundColor: "#ffeaea"
      })
}));

const StyledButton = styled(Button)({
  marginLeft: "8px",
  fontSize: "14px"
});

const truncate = input => {
  if (input && input.length > 20) return input.substring(0, 20) + "...";
  else return input;
};

const CompletedEncounter = ({
  index,
  encounter,
  subjectTypeUuid,
  encounterFormMapping,
  cancelEncounterFormMapping,
  voidGeneralEncounter
}) => {
  const { t } = useTranslation();
  const encounterId = isEmpty(encounter.earliestVisitDateTime)
    ? encounter.encounterType.name.replaceAll(" ", "-")
    : encounter.name.replaceAll(" ", "-");
  const statusMap = {
    cancelled: t("Cancelled")
  };
  let status;
  let visitUrl;
  if (encounter.cancelDateTime) {
    status = "cancelled";
  } else {
    visitUrl = `/app/subject/viewEncounter?uuid=${encounter.uuid}`;
  }
  const [voidConfirmation, setVoidConfirmation] = useState(false);

  return (
    <StyledGrid
      key={index}
      size={{
        xs: 6,
        sm: 3
      }}
    >
      <StyledPaper>
        <StyledList>
          <StyledListItem>
            {visitUrl ? (
              <Link to={visitUrl}>
                <StyledListItemText
                  title={t(defaultTo(encounter.name, encounter.encounterType.name))}
                  primary={truncate(t(defaultTo(encounter.name, encounter.encounterType.name)))}
                />
              </Link>
            ) : (
              <StyledListItemText
                title={t(defaultTo(encounter.name, encounter.encounterType.name))}
                primary={truncate(t(defaultTo(encounter.name, encounter.encounterType.name)))}
              />
            )}
          </StyledListItem>
          <StyledListItem>
            <StyledListItemTextDate
              primary={
                encounter.encounterDateTime && isValid(new Date(encounter.encounterDateTime))
                  ? format(new Date(encounter.encounterDateTime), "dd-MM-yyyy")
                  : encounter.cancelDateTime && isValid(new Date(encounter.cancelDateTime))
                  ? format(new Date(encounter.cancelDateTime), "dd-MM-yyyy")
                  : "-"
              }
            />
          </StyledListItem>
          {status && (
            <StyledListItem>
              <ListItemText>
                <StyledStatusLabel isCancelled={isEqual(status, "cancelled")}>{statusMap[status]}</StyledStatusLabel>
              </ListItemText>
            </StyledListItem>
          )}
        </StyledList>
        {encounter.encounterDateTime && encounter.uuid && !isEmpty(encounterFormMapping) ? (
          <InternalLink id={`edit-visit-${encounterId}`} to={`/app/subject/editEncounter?uuid=${encounter.uuid}`}>
            <StyledButton color="primary">{t("edit visit")}</StyledButton>
          </InternalLink>
        ) : encounter.cancelDateTime && encounter.uuid && !isEmpty(cancelEncounterFormMapping) ? (
          <InternalLink id={`edit-cancel-visit-${encounterId}`} to={`/app/subject/editCancelEncounter?uuid=${encounter.uuid}`}>
            <StyledButton color="primary">{t("edit visit")}</StyledButton>
          </InternalLink>
        ) : null}
        <DeleteButton onDelete={() => setVoidConfirmation(true)} />
        <ConfirmDialog
          title={t("GeneralEncounterVoidAlertTitle")}
          open={voidConfirmation}
          setOpen={setVoidConfirmation}
          message={t("GeneralEncounterVoidAlertMessage")}
          onConfirm={() => voidGeneralEncounter(encounter.uuid)}
        />
      </StyledPaper>
    </StyledGrid>
  );
};

const mapStateToProps = (state, props) => ({
  encounterFormMapping: selectFormMappingForEncounter(props.encounter.encounterType.uuid, props.subjectTypeUuid)(state),
  cancelEncounterFormMapping: selectFormMappingForCancelEncounter(props.encounter.encounterType.uuid, props.subjectTypeUuid)(state)
});

const mapDispatchToProps = {
  voidGeneralEncounter
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CompletedEncounter);
