import React from "react";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import Chip from "@material-ui/core/Chip";
import { useTranslation } from "react-i18next";
import { filter, get, isEmpty, join, map } from "lodash";
import { extensionScopeTypes } from "../../../formDesigner/components/Extensions/ExtensionReducer";
import { ExtensionOption } from "../subjectDashBoard/components/extension/ExtensionOption";
import SubjectTypeIcon from "../../components/SubjectTypeIcon";
import { Grid } from "@material-ui/core";

const SubjectSearchTable = ({ searchRequest, organisationConfigs }) => {
  const { t } = useTranslation();
  const searchExtensions = filter(
    get(organisationConfigs, "organisationConfig.extensions", []),
    ({ extensionScope }) => extensionScope.scopeType === extensionScopeTypes.searchResults
  );

  const renderNameWithIcon = ({ uuid, fullName, subjectTypeName }) => {
    return (
      <a href={`/#/app/subject?uuid=${uuid}`}>
        <Grid container spacing={1} direction={"row"} alignItems={"center"}>
          <Grid item>
            <SubjectTypeIcon subjectTypeName={subjectTypeName} size={20} />
          </Grid>
          <Grid item>
            <div>{fullName}</div>
          </Grid>
        </Grid>
      </a>
    );
  };

  const columns = [
    {
      title: t("name"),
      field: "fullName",
      defaultSort: "asc",
      render: rowData => renderNameWithIcon(rowData)
    },
    {
      title: t("subjectType"),
      field: "subjectType",
      render: row => row.subjectTypeName && t(row.subjectTypeName)
    },
    { title: t("gender"), field: "gender", render: row => row.gender && t(row.gender) },
    {
      title: t("age"),
      field: "dateOfBirth",
      render: row =>
        row.dateOfBirth
          ? `${new Date().getFullYear() - new Date(row.dateOfBirth).getFullYear()} ${t("years")}`
          : ""
    },
    {
      title: t("Address"),
      field: "addressLevel",
      render: row => row.addressLevel
    },
    {
      title: t("enrolments"),
      field: "activePrograms",
      sorting: false,
      render: row => {
        return row.enrolments
          ? row.enrolments.map((p, key) => (
              <Chip
                key={key}
                size="small"
                label={t(p.operationalProgramName)}
                style={{
                  margin: 2,
                  backgroundColor: p.programColor,
                  color: "white"
                }}
              />
            ))
          : "";
      }
    }
  ];

  const tableRef = React.createRef();

  const fetchData = query =>
    new Promise(resolve => {
      let apiUrl = "/web/searchAPI/v2";
      const pageElement = {};
      pageElement.pageNumber = query.page;
      pageElement.numberOfRecordPerPage = query.pageSize;
      pageElement.sortColumn = query.orderBy.field;
      pageElement.sortOrder = query.orderDirection;
      searchRequest.pageElement = pageElement;
      http
        .post(apiUrl, searchRequest)
        .then(response => response.data)
        .then(result => {
          resolve({
            data: result.listOfRecords,
            page: query.page,
            totalCount: result.totalElements
          });
        })
        .catch(err => console.log(err));
    });

  return (
    <div>
      <MaterialTable
        title=""
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
          selection: !isEmpty(searchExtensions)
        }}
        components={{
          Toolbar: props => (
            <div style={{ marginRight: "10px" }}>
              <ExtensionOption
                subjectUUIDs={join(map(props.selectedRows, "uuid"), ",")}
                scopeType={extensionScopeTypes.searchResults}
                configExtensions={get(organisationConfigs, "organisationConfig.extensions")}
              />
            </div>
          )
        }}
      />
    </div>
  );
};

export default SubjectSearchTable;
