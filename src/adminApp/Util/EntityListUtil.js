import http from "../../common/utils/httpClient";

class EntityListUtil {
  static refreshTable = ref => ref.current && ref.current.onQueryChange();

  static createVoidAction(tableRef, resourceName, entityDisplayName, entityFieldName = "name") {
    return rowData => this.voidAction(rowData, ...arguments);
  }

  static voidAction(rowData, tableRef, resourceName, entityDisplayName, entityFieldName) {
    return {
      icon: "delete_outline",
      tooltip: `Delete ${entityDisplayName.toLowerCase()}}`,
      onClick: (event, rowData) => {
        const voidedMessage = `Do you really want to delete the ${entityDisplayName.toLowerCase()} ${
          rowData[entityFieldName]
        }?`;
        if (window.confirm(voidedMessage)) {
          http.delete(`/web/${resourceName}/${rowData.id}`).then(response => {
            if (response.status === 200) {
              this.refreshTable(tableRef);
            }
          });
        }
      }
    };
  }

  static createEditAction(history, entityName, entityDisplayName) {
    return rowData => this.editAction(rowData, ...arguments);
  }

  static editAction(rowData, history, entityName, entityDisplayName) {
    return {
      icon: "edit",
      tooltip: `Edit ${entityDisplayName.toLowerCase()}`,
      onClick: () => history.push(`/appDesigner/${entityName}/${rowData.id}`),
      disabled: rowData.voided
    };
  }
}

export default EntityListUtil;
