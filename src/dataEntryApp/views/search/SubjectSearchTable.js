import React, { useEffect, useState } from "react";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import { Chip, Grid, TablePagination } from "@mui/material";
import { useTranslation } from "react-i18next";
import { filter, find, flatten, get, head, isEmpty, isNil, join, map, reject, size, uniqBy } from "lodash";
import { extensionScopeTypes } from "../../../formDesigner/components/Extensions/ExtensionReducer";
import { ExtensionOption } from "../subjectDashBoard/components/extension/ExtensionOption";
import { AgeUtil } from "openchs-models";
import { useSelector } from "react-redux";
import { selectSubjectTypes } from "../../reducers/metadataReducer";
import SubjectProfilePicture from "../../components/SubjectProfilePicture";
import materialTableIcons from "../../../common/material-table/MaterialTableIcons";

const SubjectSearchTable = ({ searchRequest, organisationConfigs }) => {
  const { i18n, t } = useTranslation();
  const subjectTypes = useSelector(selectSubjectTypes);
  const [extensions, setExtensions] = useState();
  const customSearchFields = get(organisationConfigs, "organisationConfig.searchResultFields", []);
  const subjectType = find(subjectTypes, ({ uuid }) => uuid === get(searchRequest, "subjectType"));
  const isPerson = get(subjectType, "type", "Person") === "Person";
  const getResultConcepts = customSearchFields => map(customSearchFields, ({ searchResultConcepts }) => searchResultConcepts);
  const customColumns = isEmpty(subjectType)
    ? getResultConcepts(customSearchFields)
    : getResultConcepts(filter(customSearchFields, ({ subjectTypeUUID }) => subjectTypeUUID === subjectType.uuid));

  useEffect(() => {
    setExtensions(get(organisationConfigs, "organisationConfig.extensions", []));
  }, []);
  const [pageSortCriteria, setPageSortCriteria] = useState({
    pageSize: 10,
    page: 0,
    orderDirection: "",
    orderBy: null
  });
  const [searchResponse, setSearchResponse] = useState({ searchResults: [], totalElements: -1 });
  const [loading, setLoading] = useState(false);

  const { searchResults, totalElements } = searchResponse;

  useEffect(() => {
    setLoading(true);
    fetchData(pageSortCriteria)
      .then(response => setSearchResponse({ searchResults: response.data, totalElements: response.totalElements }))
      .finally(() => setLoading(false));
  }, [pageSortCriteria]);

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

  const labelDisplayedRows = ({ from, to }) => {
    const reachedEnd = searchResults.length < pageSortCriteria.pageSize;
    return `${searchResults.length === 0 && pageSortCriteria.page === 0 ? 0 : from}–${
      reachedEnd ? from - 1 + searchResults.length : to
    } of ${reachedEnd ? from - 1 + searchResults.length : `more than ${to}`}`;
  };

  const columnsToDisplay = [
    {
      title: t("name"),
      field: "fullName",
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
      sorting: false,
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
      pageElement.pageNumber = pageSortCriteria.page;
      pageElement.numberOfRecordPerPage = pageSortCriteria.pageSize;
      pageElement.sortColumn = pageSortCriteria.orderBy && pageSortCriteria.orderBy.field;
      pageElement.sortOrder = pageSortCriteria.orderBy && pageSortCriteria.orderDirection;
      searchRequest.pageElement = pageElement;
      http
        .post(apiUrl, searchRequest)
        .then(response => response.data)
        .then(result => {
          resolve({
            data: result.listOfRecords,
            totalElements: result.totalElements,
            page: query.page
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
        data={searchResults}
        onOrderChange={(orderBy, orderDirection) =>
          setPageSortCriteria(prevState => ({ ...prevState, orderBy: columns[orderBy], orderDirection }))
        }
        isLoading={loading}
        options={{
          paging: false,
          addRowPosition: "first",
          sorting: true,
          headerStyle: {
            zIndex: 1
          },
          debounceInterval: 500,
          search: false,
          selection: !isEmpty(filter(extensions, ({ extensionScope }) => extensionScope.scopeType === extensionScopeTypes.searchResults))
        }}
        components={{
          Toolbar: props => (
            <div style={{ marginRight: "10px" }}>
              <ExtensionOption
                subjectUUIDs={join(map(props.selectedRows, "uuid"), ",")}
                scopeType={extensionScopeTypes.searchResults}
                configExtensions={extensions}
              />
            </div>
          )
        }}
      />
      <style>{`
        .MuiTableSortLabel-icon {
          opacity: 1;
          visibility: visible;
          color: #bdbdbd;
        }
        .MuiTableSortLabel-root.MuiTableSortLabel-active .MuiTableSortLabel-icon{
          color: #000000; 
          stroke: #000000; 
          stroke-width: 0.7;
        }
      `}</style>
      <TablePagination
        component={"div"}
        page={pageSortCriteria.page}
        labelRowsPerPage={""}
        rowsPerPageOptions={[10, 15, 20]}
        nextIconButtonProps={{ disabled: searchResults.length < pageSortCriteria.pageSize }}
        labelDisplayedRows={totalElements === -1 ? labelDisplayedRows : undefined}
        count={totalElements}
        rowsPerPage={pageSortCriteria.pageSize}
        onPageChange={(e, page) => setPageSortCriteria(prevState => ({ ...prevState, page }))}
        onRowsPerPageChange={e => setPageSortCriteria(prevState => ({ ...prevState, pageSize: e.target.value }))}
      />
    </div>
  );
};

export default SubjectSearchTable;
