import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { useTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import _ from "lodash";
import { LineBreak, InternalLink } from "../../../../common/components/utils";

const NewProgramVisitMenuItem = ({ title, encounter, formMappings }) => {
  const { t } = useTranslation();
  console.log("Here in NewProgramVisitMenuItem");
  console.log(title);
  console.log(encounter);
  useEffect(() => {
    //if (_.isEqual(title, t("plannedVisits")) ){
    //getProgramPlannedEncounterForm()
    //}
  }, []);
  const matchedFM = formMappings.find(
    fm =>
      fm.encounterTypeUUID === encounter.encounterType.uuid && fm.formType === "ProgramEncounter"
  );
  console.log(matchedFM);

  return (
    <InternalLink
      to={`/app/subject/programEncounter?uuid=${matchedFM.formUUID}`}
      encounter={encounter}
    >
      {encounter.name}
    </InternalLink>
  );
};

//export default NewProgramVisitMenuItem;
const mapStateToProps = state => ({
  formMappings: state.dataEntry.metadata.operationalModules.formMappings
});

const mapDispatchToProps = {
  // getProgramEnrolment,
  // getProgramEncounters
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(NewProgramVisitMenuItem)
  )
);
