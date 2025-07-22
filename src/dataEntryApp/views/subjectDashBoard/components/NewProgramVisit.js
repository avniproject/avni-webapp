import { Fragment, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Typography } from "@mui/material";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { LineBreak } from "../../../../common/components/utils";
import { getEligibleProgramEncounters, resetState } from "../../../reducers/programEncounterReducer";
import NewVisitMenuView from "./NewVisitMenuView";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { getNewEligibleProgramEncounters } from "../../../../common/mapper/ProgramEncounterMapper";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1
}));

const StyledTypography = styled(Typography)({
  fontSize: "20px"
});

const NewProgramVisit = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const eligibleEncounters = useSelector(state => state.dataEntry.programEncounterReducer.eligibleEncounters);
  const operationalModules = useSelector(state => state.dataEntry.metadata.operationalModules);
  const load = useSelector(state => state.dataEntry.loadReducer.load);

  const enrolmentUuid = searchParams.get("enrolUuid");

  useEffect(() => {
    dispatch(resetState());
    dispatch(getEligibleProgramEncounters(enrolmentUuid));
  }, [dispatch, enrolmentUuid]);

  const { planEncounterList, unplanEncounterList } = getNewEligibleProgramEncounters(operationalModules.encounterTypes, eligibleEncounters);

  const sections = [];
  if (!isEmpty(planEncounterList)) {
    sections.push({ title: t("plannedVisits"), data: planEncounterList });
  }
  if (!isEmpty(unplanEncounterList)) {
    sections.push({ title: t("unplannedVisits"), data: unplanEncounterList });
  }

  return load ? (
    <Fragment>
      <Breadcrumbs path={location.pathname} />
      <StyledPaper>
        {!isEmpty(sections) ? (
          <>
            <StyledTypography component="span">{t("newProgramVisit")}</StyledTypography>
            <LineBreak num={1} />
            <NewVisitMenuView sections={sections} uuid={enrolmentUuid} isForProgramEncounters={true} />
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

export default NewProgramVisit;
