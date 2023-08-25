import http from "../../common/utils/httpClient";

class EntityEditUtil {
  static onDelete(resource, id, entityDisplayName, onSuccessfulDelete) {
    if (window.confirm(`Do you really want to delete ${entityDisplayName}?`)) {
      http.delete(`/web/${resource}/${id}`).then(response => {
        if (response.status === 200) {
          onSuccessfulDelete();
        }
      });
    }
  }
}

export default EntityEditUtil;
