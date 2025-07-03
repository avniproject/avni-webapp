import React, { Fragment, useEffect } from "react";
import { styled } from '@mui/material/styles';
import { Paper, Typography } from "@mui/material";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { isEmpty } from "lodash";
import { withParams } from "common/components/utils";
import { useTranslation } from "react-i18next";
import { LineBreak } from "../../../../common/components/utils";
import { getEligibleProgramEncounters, resetState } from "../../../reducers/programEncounterReducer";
import NewVisitMenuView from "./NewVisitMenuView";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { getNewEligibleProgramEncounters } from "../../../../common/mapper/ProgramEncounterMapper";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1,
}));

const StyledTypography = styled(Typography)({
  fontSize: "20px",
});

const NewProgramVisit = ({ match, ...props }) => {
  const { t } = useTranslation();
  const enrolmentUuid = match.queryParams.enrolUuid;

  useEffect(() => {
    props.resetState();
    props.getEligibleProgramEncounters(enrolmentUuid);
  }, []);

  const { planEncounterList, unplanEncounterList } = getNewEligibleProgramEncounters(
    props.operationalModules.encounterTypes,
    props.eligibleEncounters
  );

  const sections = [];
  if (!isEmpty(planEncounterList)) {
    sections.push({ title: t("plannedVisits"), data: planEncounterList });
  }
  if (!isEmpty(unplanEncounterList)) {
    sections.push({ title: t("unplannedVisits"), data: unplanEncounterList });
  }

  return props.load ? (
    <Fragment>
      <Breadcrumbs path={match.path} />
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
    <CustomizedBackdrop load={props.load} />
  );
};

const mapStateToProps = (state) => ({
  eligibleEncounters: state.dataEntry.programEncounterReducer.eligibleEncounters,
  operationalModules: state.dataEntry.metadata.operationalModules,
  load: state.dataEntry.loadReducer.load,
});

const mapDispatchToProps = {
  getEligibleProgramEncounters,
  resetState,
};

export default withRouter(withParams(connect(mapStateToProps, mapDispatchToProps)(NewProgramVisit)));