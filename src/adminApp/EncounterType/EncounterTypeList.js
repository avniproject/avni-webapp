import React, { Fragment, useEffect, useState } from "react";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import _, { get } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import { ShowPrograms, ShowSubjectType } from "../WorkFlow/ShowSubjectType";
import {
  findProgramEncounterCancellationForm,
  findProgramEncounterForm
} from "../domain/formMapping";

const EncounterTypeList = ({ history }) => {
  const [redirect, setRedirect] = useState(false);
  const [formMappings, setFormMappings] = useState([]);
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [program, setProgram] = useState([]);
  const [formList, setFormList] = useState([]);

  const tableRef = React.createRef();

  useEffect(() => {
    http
      .get("/web/operationalModules")
      .then(response => {
        const formMap = response.data.formMappings;
        formMap.map(l => (l["isVoided"] = false));
        setFormMappings(formMap);
        setSubjectTypes(response.data.subjectTypes);
        setProgram(response.data.programs);
        setFormList(response.data.forms);
      })
      .catch(error => {});
  }, []);

  const columns = [
    {
      title: "Name",
      defaultSort: "asc",
      sorting: false,
      render: rowData => (
        <a href={`#/appDesigner/encounterType/${rowData.id}/show`}>{rowData.name}</a>
      )
    },
    {
      title: "Subject type",
      sorting: false,
      render: rowData => (
        <ShowSubjectType
          rowDetails={rowData}
          subjectType={subjectTypes}
          formMapping={formMappings}
          setMapping={setFormMappings}
          entityUUID="encounterTypeUUID"
        />
      )
    },
    {
      title: "Programs",
      sorting: false,
      render: rowData => (
        <ShowPrograms
          rowDetails={rowData}
          program={program}
          formMapping={formMappings}
          setMapping={setFormMappings}
        />
      )
    },
    {
      title: "Encounter form",
      field: "formName",
      sorting: false,
      render: rowData => (
        <a
          href={`#/appdesigner/forms/${get(
            findProgramEncounterForm(formMappings, rowData),
            "formUUID"
          )}`}
        >
          {get(findProgramEncounterForm(formMappings, rowData), "formName")}
        </a>
      )
    },
    {
      title: "Cancellation form",
      field: "formName",
      sorting: false,
      render: rowData => (
        <a
          href={`#/appdesigner/forms/${get(
            findProgramEncounterCancellationForm(formMappings, rowData),
            "formUUID"
          )}`}
        >
          {get(findProgramEncounterCancellationForm(formMappings, rowData), "formName")}
        </a>
      )
    }
  ];

  const fetchData = query =>
    new Promise(resolve => {
      let apiUrl = "/web/encounterType?";
      apiUrl += "size=" + query.pageSize;
      apiUrl += "&page=" + query.page;
      if (!_.isEmpty(query.orderBy.field))
        apiUrl += `&sort=${query.orderBy.field},${query.orderDirection}`;
      http
        .get(apiUrl)
        .then(response => response.data)
        .then(result => {
          resolve({
            data: result._embedded ? result._embedded.encounterType : [],
            page: result.page.number,
            totalCount: result.page.totalElements
          });
        });
    });

  const addNewConcept = () => {
    setRedirect(true);
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Encounter types" />

        <div className="container">
          <div>
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              <Button color="primary" onClick={addNewConcept}>
                {" "}
                + CREATE{" "}
              </Button>
            </div>

            <MaterialTable
              title=""
              components={{
                Container: props => <Fragment>{props.children}</Fragment>
              }}
              tableRef={tableRef}
              columns={columns}
              data={fetchData}
              options={{
                addRowPosition: "first",
                sorting: true,
                debounceInterval: 500,
                search: false,
                rowStyle: rowData => ({
                  backgroundColor: rowData["voided"] ? "#DBDBDB" : "#fff"
                })
              }}
            />
          </div>
        </div>
      </Box>
      {redirect && <Redirect to={"/appDesigner/encounterType/create"} />}
    </>
  );
};

export default withRouter(EncounterTypeList);
