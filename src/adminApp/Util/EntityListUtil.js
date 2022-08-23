import http from "../../common/utils/httpClient";

class EntityListUtil {
  static refreshTable = ref => ref.current && ref.current.onQueryChange();

  static createVoidAction(tableRef, resourceName, entityDisplayName, entityFieldName = "name") {
    return rowData => this._voidAction(rowData, ...arguments);
  }

  static _voidAction(rowData, tableRef, resourceName, entityDisplayName, entityFieldName) {
    return {
      icon: "delete_outline",
      tooltip: `Delete ${entityDisplayName.toLowerCase()}}`,
      onClick: (event, rowData) => {
        const voidedMessage = `Do you really want to delete the ${entityDisplayName.toLowerCase()} ${
          rowData[entityFieldName]
        }?`;
        if (window.confirm(voidedMessage)) {
          http
            .delete(`/web/${resourceName}/${rowData.id}`)
            .then(response => {
              if (response.status === 200) {
                this.refreshTable(tableRef);
              }
            })
            .catch(error => {});
        }
      }
    };
  }

  static createEditAction(history, resourceName, entityDisplayName) {
    return rowData => this._editAction(rowData, ...arguments);
  }

  static _editAction(rowData, history, resourceName, entityDisplayName) {
    return {
      icon: "edit",
      tooltip: `Edit ${entityDisplayName.toLowerCase()}`,
      onClick: () => history.push(`/appDesigner/${resourceName}/${rowData.id}`),
      disabled: rowData.voided
    };
  }
}

export default EntityListUtil;
