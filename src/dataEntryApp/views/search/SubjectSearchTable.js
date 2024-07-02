import React from "react";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import Chip from "@material-ui/core/Chip";
import { useTranslation } from "react-i18next";
import { filter, find, flatten, get, head, isEmpty, isNil, join, map, reject, size, uniqBy } from "lodash";
import { extensionScopeTypes } from "../../../formDesigner/components/Extensions/ExtensionReducer";
import { ExtensionOption } from "../subjectDashBoard/components/extension/ExtensionOption";
import { Grid } from "@material-ui/core";
import { AgeUtil } from "openchs-models";
import { useSelector } from "react-redux";
import { selectSubjectTypes } from "../../reducers/metadataReducer";
import SubjectProfilePicture from "../../components/SubjectProfilePicture";
import materialTableIcons from "../../../common/material-table/MaterialTableIcons";

const SubjectSearchTable = ({ searchRequest, organisationConfigs }) => {
  const { i18n, t } = useTranslation();
  const subjectTypes = useSelector(selectSubjectTypes);
  const searchExtensions = filter(
    get(organisationConfigs, "organisationConfig.extensions", []),
    ({ extensionScope }) => extensionScope.scopeType === extensionScopeTypes.searchResults
  );
  const customSearchFields = get(organisationConfigs, "organisationConfig.searchResultFields", []);
  const subjectType = find(subjectTypes, ({ uuid }) => uuid === get(searchRequest, "subjectType"));
  const isPerson = get(subjectType, "type", "Person") === "Person";
  const getResultConcepts = customSearchFields => map(customSearchFields, ({ searchResultConcepts }) => searchResultConcepts);
  const customColumns = isEmpty(subjectType)
    ? getResultConcepts(customSearchFields)
    : getResultConcepts(filter(customSearchFields, ({ subjectTypeUUID }) => subjectTypeUUID === subjectType.uuid));

  const renderNameWithIcon = ({ uuid, fullName, firstName, profilePicture, subjectTypeName }) => {
    return (
      <Grid container spacing={1} direction={"row"} alignItems={"center"}>
        <Grid item>
          <SubjectProfilePicture
            allowEnlargementOnClick={true}
            firstName={firstName}
            profilePicture={profilePicture}
            subjectType={null}
            subjectTypeName={subjectTypeName}
            size={20}
            style={{ margin: "0px" }}
          />
        </Grid>
        <Grid item>
          <div>
            <a href={`/#/app/subject?uuid=${uuid}`}>{fullName}</a>
          </div>
        </Grid>
      </Grid>
    );
  };

  const columnsToDisplay = [
    {
      title: t("name"),
      field: "fullName",
      defaultSort: "asc",
      render: rowData => renderNameWithIcon(rowData)
    },
    ...map(flatten(customColumns), ({ name }) => ({
      title: t(name),
      field: name,
      sorting: false,
      render: row => row[name]
    })),
    isEmpty(subjectType) && size(subjectTypes) > 1
      ? {
          title: t("subjectType"),
          field: "subjectType",
          render: row => row.subjectTypeName && t(row.subjectTypeName)
        }
      : null,
    isPerson ? { title: t("gender"), field: "gender", render: row => row.gender && t(row.gender) } : null,
    isPerson
      ? {
          title: t("age"),
          field: "dateOfBirth",
          render: row => (row.dateOfBirth ? AgeUtil.getDisplayAge(row.dateOfBirth, i18n) : "")
        }
      : null,
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
          ? uniqBy(row.enrolments, enr => enr.operationalProgramName).map((p, key) => (
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
  const columns = reject(columnsToDisplay, isNil);

  const tableRef = React.createRef();

  const fetchData = query =>
    new Promise(resolve => {
      let apiUrl = "/web/searchAPI/v2";
      const pageElement = {};
      const firstSubjectTypeUUID = get(head(subjectTypes), "uuid");
      if (isNil(searchRequest.subjectType) && !isNil(firstSubjectTypeUUID)) {
        searchRequest.subjectType = firstSubjectTypeUUID;
      }
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
        });
    });

  return (
    <div>
      <MaterialTable
        icons={materialTableIcons}
        title=""
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
