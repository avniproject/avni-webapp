import React, { Fragment } from "react";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import _ from "lodash";
import Chip from "@material-ui/core/Chip";
import { useTranslation } from "react-i18next";

const NewSubjectSearchTable = ({ searchRequest }) => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t("name"),
      field: "fullName",
      defaultSort: "asc",
      render: rowData => <a href={`/#/app/subject?uuid=${rowData.uuid}`}>{rowData.fullName}</a>
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
  const refreshTable = ref => ref.current && ref.current.onQueryChange();

  const fetchData = query =>
    new Promise(resolve => {
      let apiUrl = "/web/searchAPI/v2";
      const pageElement = {};
      pageElement.pageNumber = query.page;
      pageElement.numberOfRecordPerPage = query.pageSize;
      pageElement.sortColumn = query.orderBy.field;
      pageElement.sortOrder = query.orderDirection;
      searchRequest.pageElement = pageElement;
      // apiUrl += "size=" + query.pageSize;
      // apiUrl += "&page=" + query.page;
      // if (!_.isEmpty(query.search)) apiUrl += "&query=" + encodeURIComponent(query.search);
      // if (!_.isEmpty(query.orderBy.field))
      //   apiUrl += `&sort=${query.orderBy.field},${query.orderDirection}`;
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
    <>
      <div className="container">
        <div>
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
              search: false
            }}
          />
        </div>
      </div>
    </>
  );
};

export default NewSubjectSearchTable;
