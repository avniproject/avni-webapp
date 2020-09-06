import React from "react";
import { reportSideBarOptions } from "../Common";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import _, { get } from "lodash";
import Button from "@material-ui/core/Button";
import { ExportOptions } from "../ExportOptions";
import { connect } from "react-redux";
import { getOperationalModules } from "../reducers";
import { withRouter } from "react-router-dom";
import httpClient from "../../common/utils/httpClient";
import { makeStyles } from "@material-ui/core";
import SingleSelectSearch from "../../common/components/SingleSelectSearch";
import BarGraph from "../components/BarGraph";
import CircularProgress from "@material-ui/core/CircularProgress";
import Modal from "@material-ui/core/Modal";

const useStyles = makeStyles(theme => ({
  progress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    zIndex: 1
  }
}));

const AggregateReport = ({ operationalModules, getOperationalModules }) => {
  const classes = useStyles();
  const [selectedSubjectType, setSubjectType] = React.useState({});
  const [selectedProgram, setProgram] = React.useState({});
  const [selectedEncounterType, setEncounterType] = React.useState({});
  const [selectedFormType, setFormType] = React.useState();
  const [selectedForm, setForm] = React.useState();
  const [selectedConcept, setConcept] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [aggregatedResult, setAggregatedResult] = React.useState();

  React.useEffect(() => {
    getOperationalModules();
  }, []);

  const onSubjectTypeChange = option => {
    setProgram({});
    setEncounterType({});
    setSubjectType(option);
    setFormType("IndividualProfile");
  };

  const onGeneralEncounterChange = option => {
    setEncounterType(option);
    setFormType("Encounter");
  };

  const onProgramChange = option => {
    setProgram(option);
    setFormType("ProgramEnrolment");
  };

  const onProgramEncounterChange = option => {
    setEncounterType(option);
    setFormType(_.isEmpty(selectedProgram) ? "Encounter" : "ProgramEncounter");
  };

  const subjectTypes = () => {
    return (
      <ExportOptions
        options={operationalModules.subjectTypes}
        label={"Subject Type"}
        selectedOption={selectedSubjectType}
        onChange={onSubjectTypeChange}
      />
    );
  };

  const renderProgramsAndEncounters = (programs, encounters) => {
    return (
      <>
        <ExportOptions
          options={programs}
          label={"Program"}
          selectedOption={selectedProgram}
          onChange={onProgramChange}
        />
        <ExportOptions
          options={encounters}
          label={"Encounter Type"}
          selectedOption={selectedEncounterType}
          onChange={onProgramEncounterChange}
        />
      </>
    );
  };

  const renderProgramOrEncounters = () => {
    const { programs, formMappings, encounterTypes } = operationalModules;
    const validFormMappingsForSelectedSubject = formMappings.filter(
      fm => fm.subjectTypeUUID === selectedSubjectType.uuid
    );
    const validPrograms = _.intersectionWith(
      programs,
      validFormMappingsForSelectedSubject,
      (a, b) => a.uuid === b.programUUID
    );
    if (_.isEmpty(validPrograms)) {
      const validEncounters = _.intersectionWith(
        encounterTypes,
        validFormMappingsForSelectedSubject,
        (a, b) => a.uuid === b.encounterTypeUUID
      );
      return (
        <ExportOptions
          options={validEncounters}
          label={"Encounter Types"}
          selectedOption={selectedEncounterType}
          onChange={onGeneralEncounterChange}
        />
      );
    } else {
      const validFormMappingsForSelectedProgram = formMappings.filter(
        fm => fm.programUUID === selectedProgram.uuid
      );
      const validEncounters = _.intersectionWith(
        encounterTypes,
        validFormMappingsForSelectedProgram,
        (a, b) => a.uuid === b.encounterTypeUUID
      );
      return renderProgramsAndEncounters(validPrograms, validEncounters);
    }
  };

  const generateReport = () => {
    setLoading(true);
    const { formMappings } = operationalModules;
    const selectedFormMapping = _.find(
      formMappings,
      ({ formType, subjectTypeUUID, programUUID, encounterTypeUUID }) =>
        formType === selectedFormType &&
        subjectTypeUUID === selectedSubjectType.uuid &&
        selectedProgram.uuid === programUUID &&
        encounterTypeUUID === selectedEncounterType.uuid
    );
    httpClient
      .get(
        `/report/aggregate?formMappingId=${selectedForm.value}&conceptId=${selectedConcept.value}`
      )
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
          setAggregatedResult(res.data);
        }
      })
      .catch(error => {
        setLoading(false);
        const errorMessage = `${get(error, "response.data") ||
          get(error, "message") ||
          "unknown error"}`;
        alert(`Error occurred while generating report ${errorMessage}`);
      });
  };

  const onFormChange = option => {
    //get the form
    setForm(option);
  };

  const formOptions = [{ label: "Information from ASHA", value: 1340 }];
  const conceptOptions = [
    { label: "Name of Village", value: 14525 },
    { label: "Contact of Respondent", value: 14482 },
    { label: "consent notice concept", value: 14570 },
    { label: "1.1)Person has given the consent to provide the information", value: 14590 },
    { label: "2.1) did you get the PPE kit", value: 14573 },
    { label: "2.2) What is there in PPE Kit", value: 14553 },
    { label: "specify other", value: 14545 },
    { label: "2.3) If PPE is given, is it enough", value: 14580 },
    { label: "3.1) Do people demand any medicine while walking around the village", value: 14574 },
    { label: "3.2) Do you have enough medicines in the kit", value: 14576 },
    { label: "3.3) Name of Medicines available in the kit", value: 14586 },
    { label: "4.1) Did you do the survey in Village related to Covid (Corona)", value: 14572 },
    {
      label:
        "4.2) During the Survey or at present, in the village how many people are suffering from fever, cold, cough, difficulty in breathing",
      value: 14490
    },
    { label: "4.3) How many migrants returned to the village last month?", value: 14599 },
    {
      label: "5.1) Are pregnant and lactating women being vaccinated in the village?",
      value: 14600
    },
    {
      label: "5.2) Are children under 6 years of age being vaccinated in the village?",
      value: 14601
    },
    {
      label: "6.1) Do you get a regular payment of Rs.500 per month for doing Corona Survey",
      value: 14575
    },
    { label: "6.2) If not received, What is the reason for not getting 500 Rs.", value: 14507 },
    { label: "7.1) What kind of measures are being taken by VHSNC in the village", value: 14554 },
    { label: "7.2) Do you face any problems at work or in the village?", value: 14602 }
  ];

  return (
    <ScreenWithAppBar
      appbarTitle={`Aggregate reports`}
      enableLeftMenuButton={true}
      sidebarOptions={reportSideBarOptions}
    >
      {operationalModules && (
        <Box border={1} mb={2} borderColor={"#ddd"} p={2}>
          <Grid container direction={"column"} spacing={2} xs={8}>
            {/*<Grid item>*/}
            {/*  {subjectTypes()}*/}
            {/*</Grid>*/}
            {/*<Grid item>*/}
            {/*  {renderProgramOrEncounters()}*/}
            {/*</Grid>*/}
            <Grid item>
              <SingleSelectSearch
                title={"Form"}
                placeholder={"Select the form"}
                value={selectedForm}
                options={formOptions}
                onChange={onFormChange}
              />
            </Grid>
            <Grid item>
              <SingleSelectSearch
                title={"Question"}
                placeholder={"Select question"}
                value={selectedConcept}
                options={conceptOptions}
                onChange={setConcept}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                //disabled={_.isEmpty(selectedSubjectType)}
                onClick={generateReport}
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
      {!_.isEmpty(aggregatedResult) && (
        <BarGraph data={aggregatedResult.data} title={aggregatedResult.conceptName} />
      )}
      <Modal disableBackdropClick open={loading}>
        <CircularProgress size={150} className={classes.progress} />
      </Modal>
    </ScreenWithAppBar>
  );
};

const mapStateToProps = state => ({
  operationalModules: state.reports.operationalModules
});

export default withRouter(
  connect(
    mapStateToProps,
    { getOperationalModules }
  )(AggregateReport)
);
