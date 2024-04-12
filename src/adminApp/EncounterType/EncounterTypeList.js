import React, { useEffect, useState } from "react";
import http from "common/utils/httpClient";
import _, { get } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import { ShowPrograms, ShowSubjectType } from "../WorkFlow/ShowSubjectType";
import { findProgramEncounterCancellationForm, findProgramEncounterForm } from "../domain/formMapping";
import { CreateComponent } from "../../common/components/CreateComponent";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { connect } from "react-redux";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import Edit from "@material-ui/icons/Edit";
import Delete from "@material-ui/icons/DeleteOutline";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditEncounterType);
}

const EncounterTypeList = ({ history, userInfo }) => {
  const [redirect, setRedirect] = useState(false);
  const [formMappings, setFormMappings] = useState([]);
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [program, setProgram] = useState([]);

  const tableRef = React.createRef();
  const refreshTable = ref => ref.current && ref.current.onQueryChange();

  useEffect(() => {
    http.get("/web/operationalModules").then(response => {
      const formMap = response.data.formMappings;
      formMap.map(l => (l["isVoided"] = false));
      setFormMappings(formMap);
      setSubjectTypes(response.data.subjectTypes);
      setProgram(response.data.programs);
    });
  }, []);

  const columns = [
    {
      title: "Name",
      defaultSort: "asc",
      sorting: false,
      render: rowData => <a href={`#/appDesigner/encounterType/${rowData.id}/show`}>{rowData.name}</a>
    },
    {
      title: "Subject Type",
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
      render: rowData => <ShowPrograms rowDetails={rowData} program={program} formMapping={formMappings} setMapping={setFormMappings} />
    },
    {
      title: "Encounter Form",
      field: "formName",
      sorting: false,
      render: rowData => (
        <a href={`#/appdesigner/forms/${get(findProgramEncounterForm(formMappings, rowData), "formUUID")}`}>
          {get(findProgramEncounterForm(formMappings, rowData), "formName")}
        </a>
      )
    },
    {
      title: "Cancellation Form",
      field: "formName",
      sorting: false,
      render: rowData => (
        <a href={`#/appdesigner/forms/${get(findProgramEncounterCancellationForm(formMappings, rowData), "formUUID")}`}>
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
      if (!_.isEmpty(query.orderBy.field)) apiUrl += `&sort=${query.orderBy.field},${query.orderDirection}`;
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

  const editEncounterType = rowData => ({
    icon: () => <Edit />,
    tooltip: "Edit encounter type",
    onClick: event => history.push(`/appDesigner/encounterType/${rowData.id}`),
    disabled: rowData.voided
  });

  const voidEncounterType = rowData => ({
    icon: () => <Delete />,
    tooltip: "Delete encounter type",
    onClick: (event, rowData) => {
      const voidedMessage = "Do you really want to delete the encounter type " + rowData.name + " ?";
      if (window.confirm(voidedMessage)) {
        http.delete("/web/encounterType/" + rowData.id).then(response => {
          if (response.status === 200) {
            refreshTable(tableRef);
          }
        });
      }
    }
  });

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Encounter Types" />

        <div className="container">
          <div>
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              {hasEditPrivilege(userInfo) && <CreateComponent onSubmit={addNewConcept} name="New Encounter type" />}
            </div>
            <AvniMaterialTable
              title=""
              ref={tableRef}
              columns={columns}
              fetchData={fetchData}
              options={{
                pageSize: 10,
                addRowPosition: "first",
                sorting: true,
                debounceInterval: 500,
                search: false,
                rowStyle: rowData => ({
                  backgroundColor: rowData["active"] ? "#fff" : "#DBDBDB"
                })
              }}
              actions={hasEditPrivilege(userInfo) && [editEncounterType, voidEncounterType]}
              route={"/appDesigner/encounterType"}
            />
          </div>
        </div>
      </Box>
      {redirect && <Redirect to={"/appDesigner/encounterType/create"} />}
    </>
  );
};

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default withRouter(connect(mapStateToProps)(EncounterTypeList));
