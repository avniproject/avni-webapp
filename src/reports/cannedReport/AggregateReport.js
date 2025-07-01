import React from "react";
import { GridLegacy as Grid, Button } from "@mui/material";
import { chain, find, get, isEmpty, map } from "lodash";
import { connect } from "react-redux";
import { getOperationalModules } from "../reducers";
import { withRouter } from "react-router-dom";
import httpClient from "../../common/utils/httpClient";
import SingleSelectSearch from "../../common/components/SingleSelectSearch";
import BarGraph from "../components/BarGraph";
import PieGraph from "../components/PieGraph";
import CustomizedBackdrop from "../../dataEntryApp/components/CustomizedBackdrop";
import BorderBox from "../../formDesigner/components/BorderBox";

const AggregateReport = ({ operationalModules, getOperationalModules }) => {
  const [selectedForm, setForm] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [aggregatedResult, setAggregatedResult] = React.useState();

  React.useEffect(() => {
    getOperationalModules();
  }, []);

  const generateReport = () => {
    setLoading(true);
    const selectedFormMapping = find(operationalModules.formMappings, ({ formUUID }) => selectedForm.value === formUUID);
    if (isEmpty(selectedFormMapping)) {
      setLoading(false);
      return;
    }
    httpClient
      .get(`/report/aggregate/codedConcepts?formMappingId=${selectedFormMapping.id}`)
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
          setAggregatedResult(res.data);
        }
      })
      .catch(error => {
        setLoading(false);
        const errorMessage = `${get(error, "response.data") || get(error, "message") || "unknown error"}`;
        alert(`Error occurred while generating report ${errorMessage}`);
      });
  };

  function renderReports() {
    return map(aggregatedResult, ({ data, concept, isPie }) =>
      isPie ? (
        <PieGraph
          data={map(data, ({ count, indicator }) => ({ id: indicator, value: count }))}
          title={concept.name}
          id={concept.id}
          key={concept.id}
        />
      ) : (
        <BarGraph data={data} title={concept.name} id={concept.id} key={concept.id} />
      )
    );
  }

  const getFormOptions = isEmpty(operationalModules)
    ? {}
    : chain(operationalModules.forms)
        .intersectionWith(operationalModules.formMappings, (f, fm) => f.formUUID === fm.formUUID)
        .map(({ formName, formUUID }) => ({ label: formName, value: formUUID }))
        .value();

  return (
    <React.Fragment>
      {operationalModules && (
        <BorderBox>
          <Grid container direction={"column"} spacing={2}>
            <Grid item xs={8}>
              <SingleSelectSearch
                title={"Form"}
                placeholder={"Select the form"}
                value={selectedForm}
                options={getFormOptions}
                onChange={option => setForm(option)}
              />
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" disabled={isEmpty(selectedForm)} onClick={generateReport}>
                Generate Report
              </Button>
            </Grid>
          </Grid>
          <div style={{ marginTop: 10 }}>{renderReports()}</div>
        </BorderBox>
      )}
      <CustomizedBackdrop load={!loading} />
    </React.Fragment>
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
