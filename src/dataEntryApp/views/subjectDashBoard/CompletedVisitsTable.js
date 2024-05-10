import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import { find, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { mapObservations } from "common/subjectModelMapper";
import { Box, Grid } from "@material-ui/core";
import { Link } from "react-router-dom";
import { selectFormMappingForEncounter } from "../../sagas/encounterSelector";
import { selectFormMappingForProgramEncounter } from "../../sagas/programEncounterSelector";
import { connect } from "react-redux";
import { getEncounterForm } from "../../reducers/programSubjectDashboardReducer";
import Observations from "dataEntryApp/components/Observations";
import CustomizedBackdrop from "../../components/CustomizedBackdrop";
import { DeleteButton } from "../../components/DeleteButton";
import { formatDate } from "../../../common/utils/General";
import { KeyboardArrowDown, KeyboardArrowUp } from "@material-ui/icons";
import materialTableIcons from "../../../common/material-table/MaterialTableIcons";

const useStyles = makeStyles(theme => ({
  editLabel: {
    textTransform: "uppercase",
    fontWeight: 500
  }
}));

const transformApiResponse = response => {
  response.observations = mapObservations(response.observations);
  response.cancelObservations = mapObservations(response.cancelObservations);
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
  const requiredFormDetails = find(encounterForms, ef => ef.formUUID === formUUID);

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
    <CustomizedBackdrop load={!isEmpty(requiredFormDetails)} />
  );
};

const mapDispatchToProps = {
  getEncounterForm
};

const EncounterObservations = connect(
  mapStateToProps,
  mapDispatchToProps
)(EncounterObs);

const CompletedVisitsTable = ({
  apiUrl,
  viewEncounterUrl,
  filterParams,
  entityUuid,
  editEncounterUrl,
  isForProgramEncounters,
  onDelete
}) => {
  const { t } = useTranslation();
  const columns = [
    {
      title: t("visitName"),
      field: "name",
      render: row => {
        return t(row.name || row.encounterType.name);
      }
    },
    {
      title: t("visitcompleteddate"),
      field: "encounterDateTime",
      type: "date",
      defaultSort: "desc",
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
      sorting: false,
      render: row => (
        <Grid container alignItems={"center"} alignContent={"center"} spacing={10}>
          <Grid item>
            <EditVisit
              editEncounterUrl={editEncounterUrl(row.cancelDateTime ? "cancel" : "")}
              encounter={row}
              isForProgramEncounters={isForProgramEncounters}
            />
          </Grid>
          <Grid item>
            <DeleteButton onDelete={() => onDelete(row)} />
          </Grid>
        </Grid>
      )
    }
  ];

  const tableRef = React.createRef();
  const refreshTable = ref => ref.current && ref.current.onQueryChange();

  useEffect(() => {
    refreshTable(tableRef);
  }, [filterParams]);

  const fetchData = query =>
    new Promise(resolve => {
      const params = { ...filterParams };
      params.page = query.page;
      params.size = query.pageSize;
      if (!isEmpty(query.orderBy.field))
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
        });
    });

  return (
    <MaterialTable
      icons={materialTableIcons}
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
        headerStyle: {
          zIndex: 1
        },
        debounceInterval: 500,
        search: false,
        toolbar: false,
        detailPanelColumnAlignment: "right"
      }}
      detailPanel={[
        {
          icon: () => <KeyboardArrowDown />,
          openIcon: () => <KeyboardArrowUp />,
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

export default CompletedVisitsTable;
