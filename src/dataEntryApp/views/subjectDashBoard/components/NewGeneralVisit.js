import { Fragment, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Paper } from "@mui/material";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { LineBreak } from "../../../../common/components/utils";
import { getEligibleEncounters, resetState } from "../../../reducers/encounterReducer";
import NewVisitMenuView from "./NewVisitMenuView";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { getNewEligibleEncounters } from "../../../../common/mapper/EncounterMapper";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1
}));

const StyledTypography = styled(Typography)({
  fontSize: "20px"
});

const NewGeneralVisit = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const operationalModules = useSelector(state => state.dataEntry.metadata.operationalModules);
  const eligibleEncounters = useSelector(state => state.dataEntry.encounterReducer.eligibleEncounters);
  const load = useSelector(state => state.dataEntry.loadReducer.load);

  const subjectUuid = searchParams.get("subjectUuid");

  useEffect(() => {
    dispatch(resetState());
    dispatch(getEligibleEncounters(subjectUuid));
  }, [dispatch, subjectUuid]);

  const { scheduledEncounters, unplannedEncounters } = getNewEligibleEncounters(operationalModules.encounterTypes, eligibleEncounters);

  const sections = [];
  if (!isEmpty(scheduledEncounters)) {
    sections.push({ title: t("plannedVisits"), data: scheduledEncounters });
  }
  if (!isEmpty(unplannedEncounters)) {
    sections.push({ title: t("unplannedVisits"), data: unplannedEncounters });
  }

  return load ? (
    <Fragment>
      <Breadcrumbs path={location.pathname} />
      <StyledPaper>
        {!isEmpty(sections) ? (
          <>
            <StyledTypography component="span">{t("newGeneralVisit")}</StyledTypography>
            <LineBreak num={1} />
            <NewVisitMenuView sections={sections} uuid={subjectUuid} />
          </>
        ) : (
          <Typography variant="caption" sx={{ mb: 1 }}>
            {" "}
            {t("no")} {t("plannedVisits")} / {t("unplannedVisits")}{" "}
          </Typography>
        )}
      </StyledPaper>
    </Fragment>
  ) : (
    <CustomizedBackdrop load={load} />
  );
};

export default NewGeneralVisit;
