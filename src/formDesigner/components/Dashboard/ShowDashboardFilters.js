import React, { useEffect } from "react";
import MaterialTable from "material-table";
import http from "../../../common/utils/httpClient";
import { buildFilterData, filterDisplayColumns } from "../../../adminApp/CustomFilters";

const ShowDashboardFilters = ({ filters, editAction, deleteAction }) => {
  const [subjectTypes, setSubjectTypes] = React.useState([]);

  useEffect(() => {
    http.get("/subjectType").then(res => {
      res.data && setSubjectTypes(res.data._embedded.subjectType);
    });
  }, []);

  return (
    <MaterialTable
      columns={filterDisplayColumns}
      data={filters && buildFilterData(filters.map(f => f.filter), subjectTypes)}
      options={{ search: false, paging: false, toolbar: false }}
      actions={
        editAction || deleteAction
          ? [
              editAction && {
                icon: "edit",
                tooltip: "Edit",
                onClick: (event, filter) => {
                  editAction(filter);
                }
              },
              deleteAction && {
                icon: "delete",
                tooltip: "Delete",
                onClick: (event, filter) => {
                  deleteAction(filter);
                }
              }
            ]
          : []
      }
    />
  );
};

export default ShowDashboardFilters;
