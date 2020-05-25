import React, { Fragment, useState, useEffect } from "react";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import _, { get, isEqual } from "lodash";
import { withRouter, Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import WorkFlowFormCreation from "../WorkFlow/WorkFlowFormCreation";
import { ShowSubjectType } from "../WorkFlow/ShowSubjectType";
import {
  findProgramEncounterForm,
  findProgramEnrolmentForm,
  findProgramExitForm
} from "../domain/formMapping";
import { CreateComponent } from "../../common/components/CreateComponent";

const ProgramList = ({ history }) => {
  const [formMappings, setFormMappings] = useState([]);
  const [subjectType, setSubjectType] = useState([]);
  const [notificationAlert, setNotificationAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [formList, setFormList] = useState([]);

  useEffect(() => {
    http
      .get("/web/operationalModules")
      .then(response => {
        const formMap = response.data.formMappings;
        formMap.map(l => (l["isVoided"] = false));
        setFormMappings(formMap);
        setSubjectType(response.data.subjectTypes);
        setFormList(response.data.forms);
      })
      .catch(error => {});
  }, []);

  const columns = [
    {
      title: "Name",
      defaultSort: "asc",
      sorting: false,
      render: rowData => <a href={`#/appDesigner/program/${rowData.id}/show`}>{rowData.name}</a>
    },
    {
      title: "Subject Type",
      sorting: false,
      render: rowData => (
        <ShowSubjectType
          rowDetails={rowData}
          subjectType={subjectType}
          formMapping={formMappings}
          setMapping={setFormMappings}
          entityUUID="programUUID"
        />
      )
    },
    {
      title: "Enrolment Form",
      field: "formName",
      sorting: false,
      render: rowData => (
        <a
          href={`#/appdesigner/forms/${get(
            findProgramEnrolmentForm(formMappings, rowData),
            "formUUID"
          )}`}
        >
          {get(findProgramEnrolmentForm(formMappings, rowData), "formName")}
        </a>
      )
    },
    {
      title: "Exit Form",
      field: "formName",
      sorting: false,
      render: rowData => (
        <a
          href={`#/appdesigner/forms/${get(
            findProgramExitForm(formMappings, rowData),
            "formUUID"
          )}`}
        >
          {get(findProgramExitForm(formMappings, rowData), "formName")}
        </a>
      )
    },
    {
      title: "Colour",
      field: "colour",
      type: "string",
      sorting: false,
      render: rowData => (
        <div
          style={{ width: "20px", height: "20px", border: "1px solid", background: rowData.colour }}
        >
          &nbsp;
        </div>
      )
    }
  ];

  const [redirect, setRedirect] = useState(false);

  const tableRef = React.createRef();
  const refreshTable = ref => ref.current && ref.current.onQueryChange();

  const fetchData = query =>
    new Promise(resolve => {
      let apiUrl = "/web/program?";
      apiUrl += "size=" + query.pageSize;
      apiUrl += "&page=" + query.page;
      if (!_.isEmpty(query.orderBy.field))
        apiUrl += `&sort=${query.orderBy.field},${query.orderDirection}`;
      http
        .get(apiUrl)
        .then(response => response.data)
        .then(result => {
          resolve({
            data: result._embedded ? result._embedded.program : [],
            page: result.page.number,
            totalCount: result.page.totalElements
          });
        });
    });

  const addNewConcept = () => {
    setRedirect(true);
  };

  const editProgram = rowData => ({
    icon: "edit",
    tooltip: "Edit program",
    onClick: event => history.push(`/appDesigner/program/${rowData.id}`),
    disabled: rowData.voided
  });

  const voidProgram = rowData => ({
    icon: "delete_outline",
    tooltip: "Delete program",
    onClick: (event, rowData) => {
      const voidedMessage = "Do you really want to delete the program " + rowData.name + " ?";
      if (window.confirm(voidedMessage)) {
        http
          .delete("/web/program/" + rowData.id)
          .then(response => {
            if (response.status === 200) {
              refreshTable(tableRef);
            }
          })
          .catch(error => {});
      }
    }
  });

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Programs" />

        <div className="container">
          <div>
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              <CreateComponent onSubmit={addNewConcept} name="New Program" />
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
                  backgroundColor: rowData["active"] ? "#fff" : "#DBDBDB"
                })
              }}
              actions={[editProgram, voidProgram]}
            />
          </div>
        </div>
      </Box>
      {redirect && <Redirect to={"/appDesigner/program/create"} />}
    </>
  );
};
function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default withRouter(React.memo(ProgramList, areEqual));
