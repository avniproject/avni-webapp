import React, { Fragment, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { mapObservation } from "common/subjectModelMapper";
import { Box } from "@material-ui/core";
import { Link } from "react-router-dom";
import moment from "moment/moment";
import { selectFormMappingForEncounter } from "../../sagas/encounterSelector";
import { selectFormMappingForProgramEncounter } from "../../sagas/programEncounterSelector";
import { connect } from "react-redux";
import { getEncounterForm } from "../../reducers/programSubjectDashboardReducer";
import Observations from "dataEntryApp/components/Observations";
import CustomizedBackdrop from "../../components/CustomizedBackdrop";

const useStyles = makeStyles(theme => ({
  editLabel: {
    textTransform: "uppercase",
    fontWeight: 500
  }
}));

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const formatDate = aDate => (aDate ? moment(aDate).format("DD-MM-YYYY") : "-");

const transformApiResponse = response => {
  response.observations = mapObservation(response.observations);
  response.cancelObservations = mapObservation(response.cancelObservations);
};

const EditVisitLink = ({
  editEncounterUrl,
  encounter,
  isForProgramEncounters,
  encounterFormMapping,
  programEncounterFormMapping
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isFormAvailable = isForProgramEncounters
    ? programEncounterFormMapping
    : encounterFormMapping;

  return isFormAvailable ? (
    <Link to={`${editEncounterUrl}?uuid=${encounter.uuid}`} className={classes.editLabel}>
      {" "}
      {t("edit visit")}
    </Link>
  ) : (
    "-"
  );
};

const mapStateToProps = (state, props) => ({
  encounterFormMapping: selectFormMappingForEncounter(
    props.encounter.encounterType.uuid,
    state.dataEntry.subjectProfile.subjectProfile.subjectType.uuid
  )(state),
  programEncounterFormMapping:
    props.isForProgramEncounters &&
    selectFormMappingForProgramEncounter(
      props.encounter.encounterType.uuid,
      state.dataEntry.programEncounterReducer.programEnrolment.program.uuid,
      state.dataEntry.subjectProfile.subjectProfile.subjectType.uuid
    )(state),
  encounterForms: state.dataEntry.subjectProgram.encounterForms
});

const EditVisit = connect(mapStateToProps)(EditVisitLink);

const EncounterObs = ({
  encounter,
  isForProgramEncounters,
  encounterFormMapping,
  programEncounterFormMapping,
  encounterForms,
  getEncounterForm
}) => {
  const formMapping = isForProgramEncounters ? programEncounterFormMapping : encounterFormMapping;
  const formUUID = formMapping.formUUID;
  const requiredFormDetails = _.find(encounterForms, ef => ef.formUUID === formUUID);

  React.useEffect(() => {
    if (!requiredFormDetails) {
      getEncounterForm(formUUID);
    }
  }, []);

  return requiredFormDetails ? (
    <Observations
      observations={
        encounter.encounterDateTime ? encounter.observations : encounter.cancelObservations || []
      }
      form={requiredFormDetails.form}
      customKey={encounter.uuid}
      key={encounter.uuid}
    />
  ) : (
    <CustomizedBackdrop load={!_.isEmpty(requiredFormDetails)} />
  );
};

const mapDispatchToProps = {
  getEncounterForm
};

const EncounterObservations = connect(
  mapStateToProps,
  mapDispatchToProps
)(EncounterObs);

const NewCompletedVisitsTable = ({
  apiUrl,
  viewEncounterUrl,
  filterParams,
  entityUuid,
  editEncounterUrl,
  isForProgramEncounters,
  enableReadOnly
}) => {
  const { t } = useTranslation();
  const prev = usePrevious(filterParams);
  const columns = [
    {
      title: t("visitName"),
      field: "name",
      defaultSort: "asc",
      render: row => {
        const valueToDisplay = row.name ? t(row.name) : t(row.encounterType.name);
        const action = row.cancelDateTime ? "cancel" : "";
        return <Link to={`${viewEncounterUrl(action)}?uuid=${row.uuid}`}>{valueToDisplay}</Link>;
      }
    },
    {
      title: t("visitcompleteddate"),
      field: "encounterDateTime",
      render: row => formatDate(row.encounterDateTime)
    },
    {
      title: t("visitCanceldate"),
      field: "cancelDateTime",
      render: row => formatDate(row.cancelDateTime)
    },
    {
      title: t("visitscheduledate"),
      field: "earliestVisitDateTime",
      render: row => formatDate(row.earliestVisitDateTime)
    },
    {
      title: t("actions"),
      field: "actions",
      hidden: enableReadOnly,
      sorting: false,
      render: row => (
        <EditVisit
          editEncounterUrl={editEncounterUrl(row.cancelDateTime ? "cancel" : "")}
          encounter={row}
          isForProgramEncounters={isForProgramEncounters}
        />
      )
    }
  ];

  const tableRef = React.createRef();
  const refreshTable = ref => ref.current && ref.current.onQueryChange();

  useEffect(() => {
    refreshTable(tableRef);
  });

  const fetchData = query =>
    new Promise(resolve => {
      const params = { ...filterParams };
      params.page = query.page;
      params.size = query.pageSize;
      if (!_.isEmpty(query.orderBy.field))
        params.sort = `${query.orderBy.field},${query.orderDirection}`;
      const filterQueryString = new URLSearchParams(params).toString();
      http
        .get(`${apiUrl}?${filterQueryString}`)
        .then(response => response.data)
        .then(result => {
          result.content.forEach(e => transformApiResponse(e));
          if (result.content.length === 0) {
            resolve({
              data: result.content,
              page: 0,
              totalCount: result.totalElements
            });
          } else {
            resolve({
              data: result.content,
              page: result.number,
              totalCount: result.totalElements
            });
          }
        })
        .catch(err => console.log(err));
    });

  return (
    <MaterialTable
      title=""
      components={{
        Container: props => <Fragment>{props.children}</Fragment>
      }}
      tableRef={tableRef}
      columns={columns}
      data={fetchData}
      options={{
        pageSize: 10,
        pageSizeOptions: [10, 15, 20],
        addRowPosition: "first",
        sorting: true,
        debounceInterval: 500,
        search: false,
        toolbar: false,
        detailPanelColumnAlignment: "right"
      }}
      detailPanel={[
        {
          icon: "keyboard_arrow_down",
          openIcon: "keyboard_arrow_up",
          render: row => {
            return (
              <Box margin={1} key={row.uuid}>
                <EncounterObservations
                  encounter={row}
                  isForProgramEncounters={isForProgramEncounters}
                />
              </Box>
            );
          }
        }
      ]}
    />
  );
};

export default NewCompletedVisitsTable;
